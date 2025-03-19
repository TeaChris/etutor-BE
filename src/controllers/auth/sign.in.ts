import type {Request,Response} from 'express'
import {DateTime} from 'luxon'

import {ENVIRONMENT,Provider,ILocation,IUser, AppResponse,AppError,extractUAData,sendVerificationEmail,setCookie,setCache,toJSON} from "../../common";

import {catchAsync} from "../../middlewares";
import {UserModel,locationModel} from "../../models";
import {addEmailToQueue} from "../../queues";

export const signIn=catchAsync(async(req:Request,res:Response)=>{
    const {email,password}=req.body

    if(!email || !password) {
        throw new AppError('Email and password are required fields')
    }

    const user = await UserModel.findOne({ email, provider: Provider.Local }).select(
        '+refreshToken +loginRetries +isSuspended +isEmailVerified +lastLogin +password +twoFA.type +twoFA.active'
    );

    if(!user) {
        throw new AppError('Email or password is incorrect', 401);
    }

    // check if user has exceeded login retries (3 times in 12 hours)
    const currentRequestTime = DateTime.now();
    const lastLoginRetry = currentRequestTime.diff(DateTime.fromISO(user.lastLogin.toISOString()), 'hours');

    if (user.loginRetries >= 3 && Math.round(lastLoginRetry.hours) < 12) {
        throw new AppError('login retries exceeded!', 401);
        // send an email to user to reset password
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
        await UserModel.findByIdAndUpdate(user._id, {
            $inc: { loginRetries: 1 },
        });
        throw new AppError('Email or password is incorrect', 401);
    }

    if (!user.isEmailVerified) {
        await sendVerificationEmail(user, req);
        // do not change status code from 422 as it will break frontend logic
        // 422 helps them handle redirection to email verification page
        throw new AppError('Your email is yet to be verified', 422, `email-unverified:${user.email}`);
    }

    if (user.isSuspended) {
        throw new AppError('Your account is currently suspended', 401);
    }

    // generate access and refresh tokens and set cookies
    const accessToken = await hashData({ id: user._id.toString() }, { expiresIn: ENVIRONMENT.JWT_EXPIRES_IN.ACCESS });
    setCookie(res, 'etutorAccessToken', accessToken, {
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
})