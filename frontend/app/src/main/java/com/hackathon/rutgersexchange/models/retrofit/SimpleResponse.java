package com.hackathon.rutgersexchange.models.retrofit;

/**
 * Created by patrick on 10/3/15.
 */
public class SimpleResponse {
    public boolean error;
    public int id;
    public SimpleError[] errors;
}
class SimpleError{
    String field;
    String message;
}
