package com.hackathon.rutgersexchange.network;

import com.hackathon.rutgersexchange.models.retrofit.SimpleResponse;
import com.hackathon.rutgersexchange.models.retrofit.User;
import com.hackathon.rutgersexchange.models.retrofit.UserInfo;
import com.hackathon.rutgersexchange.models.retrofit.UserSession;
import com.hackathon.rutgersexchange.models.retrofit.UserUpdate;

import java.util.List;

import retrofit.Call;
import retrofit.Callback;
import retrofit.http.Body;
import retrofit.http.DELETE;
import retrofit.http.GET;
import retrofit.http.POST;
import retrofit.http.PUT;
import retrofit.http.Path;

/**
 * Created by patrick on 10/3/15.
 */
public interface BackendService {

    @PUT ("/users")
    Call<SimpleResponse> createUser(@Body User user);

    @PUT ("/users/{username}")
    Call<UserSession> createSession(@Path ("username") String username, @Body String password);

    @GET ("/users/{username}")
    Call<UserInfo> getUser(@Path ("username") String username, @Body UserSession userSession);

    @POST ("/users/{user_id}")//not sure if correct callback
    Call<SimpleResponse> updateUser(@Path ("user_id") int user_id, @Body UserUpdate userUpdate);

    @DELETE ("/users/{username}")//not sure if correct callback
    Call<SimpleResponse> deleteUser(@Path("username") String username, @Body UserSession userSession);
}


