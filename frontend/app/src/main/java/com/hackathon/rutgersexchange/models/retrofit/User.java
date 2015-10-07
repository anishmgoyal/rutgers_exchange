package com.hackathon.rutgersexchange.models.retrofit;

/**
 * Created by patrick on 10/3/15.
 */
public class User {
    public String username;
    public String first_name;
    public String last_name;
    public String email_address;
    public String password;
    public String confirm_password;
    public String phone_number;
    public User(){

    }

    public User (String username, String first_name, String last_name, String email_address, String password, String confirm_password, String phone_number) {
        this.username = username;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email_address = email_address;
        this.password = password;
        this.confirm_password = confirm_password;
        this.phone_number = phone_number;
    }
}
