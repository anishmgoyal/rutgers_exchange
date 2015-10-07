package com.hackathon.rutgersexchange.injection;

import com.hackathon.rutgersexchange.activity.LoginActivity;

import javax.inject.Singleton;

import dagger.Component;

/**
 * Created by patrick on 10/3/15.
 */

@Component (modules = {SingletonModule.class})
@Singleton
public interface RUComponent {
    void inject (LoginActivity loginActivity);
}
