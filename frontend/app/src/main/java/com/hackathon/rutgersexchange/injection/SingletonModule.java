package com.hackathon.rutgersexchange.injection;

import dagger.Module;
import dagger.Provides;

import com.hackathon.rutgersexchange.RutgersExchangeApplication;
import com.hackathon.rutgersexchange.network.BackendService;
import com.squareup.okhttp.OkHttpClient;

import retrofit.GsonConverterFactory;
import retrofit.Retrofit;
import retrofit.Retrofit.Builder;

import javax.inject.Singleton;

/**
 * Created by patrick on 10/3/15.
 */

@Module
public class SingletonModule {

    protected RutgersExchangeApplication context;

    public SingletonModule (RutgersExchangeApplication application) {
        this.context = application;
    }

    @Provides
    @Singleton
    BackendService provideBackendService () {

        Retrofit retrofit =
                new Retrofit.Builder()
                        .addConverterFactory(GsonConverterFactory.create())
                                                     .baseUrl("http://45.79.147.254")
                                                     .build();

        return retrofit.create(BackendService.class);
    }
}
