package com.hackathon.rutgersexchange.activity;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.google.gson.Gson;
import com.hackathon.rutgersexchange.R;
import com.hackathon.rutgersexchange.RutgersExchangeApplication;
import com.hackathon.rutgersexchange.models.retrofit.SimpleResponse;
import com.hackathon.rutgersexchange.models.retrofit.User;
import com.hackathon.rutgersexchange.network.BackendService;
import com.hackathon.rutgersexchange.widgets.MainDrawer;

import javax.inject.Inject;

import butterknife.Bind;
import butterknife.ButterKnife;
import butterknife.OnClick;
import retrofit.Call;
import retrofit.Callback;
import retrofit.Response;
import retrofit.Retrofit;

public class LoginActivity extends AppCompatActivity {

    @Bind (R.id.login_activity_login_bttn)           Button   loginBtn;
    @Bind (R.id.login_activity_register_bttn)        Button   registerBtn;

    @Inject BackendService service;
    public View dialogView;

    @Override
    protected void onCreate (Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        ((RutgersExchangeApplication) getApplication()).getmComponent().inject(this);
        ButterKnife.bind(this);
        MainDrawer drawer = new MainDrawer();
        //drawer.disableLearningPattern();

    }

    @OnClick (R.id.login_activity_login_bttn)
    public void onLoginClick () {
        // TODO fill in login on click
    }

    @OnClick (R.id.login_activity_register_bttn)
    public void onRegisterClick (View v) {
        final LayoutInflater linf = LayoutInflater.from(this);
        final View inflator = linf.inflate(R.layout.dialog_register, null);
        final AlertDialog.Builder builder = new AlertDialog.Builder(LoginActivity.this);
        builder.setTitle(getString(R.string.register_dialog_title));
        builder.setView(inflator);
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick (DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        }).setPositiveButton("Register", new DialogInterface.OnClickListener() {
            @Override
            public void onClick (final DialogInterface dialog, int which) {
                String un = ((EditText) inflator.findViewById(R.id.register_dialog_username)).getText().toString();
                String fn = ((EditText) inflator.findViewById(R.id.register_dialog_firstname)).getText().toString();
                String ln = ((EditText) inflator.findViewById(R.id.register_dialog_lastname)).getText().toString();
                String email = ((EditText) inflator.findViewById(R.id.register_dialog_email_text)).getText().toString();
                String numbr= ((EditText) inflator.findViewById(R.id.register_dialog_numbr_text)).getText().toString();
                String passwd= ((EditText) inflator.findViewById(R.id.register_dialog_passwd_text)).getText().toString();
                String passwdConfirm = ((EditText) inflator.findViewById(R.id.register_dialog_passwd_confirm_text)).getText().toString();
                User newUser = new User(un, fn, ln, email, passwd, passwdConfirm, numbr);
                Call<SimpleResponse> sr = service.createUser(newUser);
                sr.enqueue(new Callback<SimpleResponse>() {
                    @Override
                    public void onResponse (Response<SimpleResponse> response, Retrofit retrofit) {
                        if(response.body().error == false){
                            dialog.dismiss();
                        }else{
                            Toast.makeText(getApplicationContext(), "Error registering, please try again.", Toast.LENGTH_LONG).show();
                            dialog.dismiss();
                            //builder.setView(linf.inflate(R.layout.dialog_register, null));
                            //builder.create().show();
                        }
                    }

                    @Override
                    public void onFailure (Throwable t) {
                        t.getMessage();
                        dialog.dismiss();
                    }
                });
            }
        });

        //Create and show the alert dialog.
        AlertDialog alertDialog = builder.create();
        alertDialog.show();
    }

    @Override
    public boolean onCreateOptionsMenu (Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_login, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected (MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
