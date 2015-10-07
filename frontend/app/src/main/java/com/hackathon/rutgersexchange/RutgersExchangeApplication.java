package com.hackathon.rutgersexchange;

import android.app.Application;

import com.hackathon.rutgersexchange.injection.DaggerRUComponent;
import com.hackathon.rutgersexchange.injection.RUComponent;
import com.hackathon.rutgersexchange.injection.SingletonModule;

/**
 * Created by patrick on 10/3/15.
 */
public class RutgersExchangeApplication extends Application {

    RUComponent mComponent;

    @Override
    public void onCreate () {
        super.onCreate();

        mComponent = DaggerRUComponent.builder()
                .singletonModule(new SingletonModule(this))
                .build();
    }

    public RUComponent getmComponent () {
        return mComponent;
    }
}
