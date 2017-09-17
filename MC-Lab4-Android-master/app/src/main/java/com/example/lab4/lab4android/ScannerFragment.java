package com.example.lab4.lab4android;


import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CompoundButton;
import android.widget.ListView;
import android.widget.ProgressBar;

import com.example.lab4.lab4android.utils.BTUtils;

import java.io.IOException;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnCheckedChanged;
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import timber.log.Timber;


public class ScannerFragment extends Fragment implements DeviceScanListAdapter.OnBeaconFoundListener{

    @BindView(R.id.progressBar)
    ProgressBar progressBar;

    private DeviceScanListAdapter mDeviceAdapter;
    private OkHttpClient client;

    public ScannerFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRetainInstance(true);
         client = new OkHttpClient();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_scanner, container, false);
        ButterKnife.bind(this, view);
        mDeviceAdapter = new DeviceScanListAdapter(this.getContext(),this);
        ListView listViewScannedItems = (ListView) view.findViewById(R.id.listViewScannedItems);
        listViewScannedItems.setAdapter(mDeviceAdapter);
        return view;
    }


    @OnCheckedChanged(R.id.buttonScanner)
    void changeScanStatus(CompoundButton buttonView, boolean isChecked){
        Timber.d("Scan button clicked");
        if(isChecked){
            // Clear existing devices (assumes none are connected)
            mDeviceAdapter.clear();
            progressBar.setVisibility(View.VISIBLE);
            BTUtils.startScanning(this.getContext(), mDeviceAdapter, buttonView,progressBar);
        }else{
            BTUtils.stopScanning(this.getContext());
            progressBar.setVisibility(View.INVISIBLE);
        }
    }


    @Override
    public void onBeaconFound(String majorId) {
        //send the major id to node server through its REST API, it should know which location each major id corresponds to.
        //major ids are sent as 40,41,42,43. 40 and 41 are my beacon ids, 42, 43 should be yours

        String url = getString(R.string.url) + majorId;
        Timber.d("url is " + url);

        Request request = new Request.Builder().url(url).build();

//            Response response = client.newCall(request).execute();
          client.newCall(request).enqueue(new okhttp3.Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Timber.e("IO exception which connecting to server ");

                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    Timber.d("response code is " + response.code());


                }
            });

        }


    }

