package com.example.lab4.lab4android;

import android.Manifest;
import android.os.Bundle;
import android.support.design.widget.Snackbar;
import android.support.design.widget.TabLayout;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.ViewPager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.ViewGroup;

import com.example.lab4.lab4android.utils.BTUtils;
import com.karumi.dexter.Dexter;
import com.karumi.dexter.listener.single.PermissionListener;
import com.karumi.dexter.listener.single.SnackbarOnDeniedPermissionListener;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class MainActivity extends AppCompatActivity {


    @BindView(R.id.container) ViewPager viewPager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // If BLE support isn't there, quit the app
        BTUtils.checkBluetoothSupport(this);
        setContentView(R.layout.activity_main);

        ViewGroup rootView = (ViewGroup) findViewById(android.R.id.content);
        PermissionListener snackbarPermissionListener =
                SnackbarOnDeniedPermissionListener.Builder
                        .with(rootView, "Location is needed to detect BLE devices near you")
                        .withOpenSettingsButton("Settings")
                        .withCallback(new Snackbar.Callback() {
                            @Override
                            public void onShown(Snackbar snackbar) {
                                // Event handler for when the given Snackbar is visible
                            }
                            @Override
                            public void onDismissed(Snackbar snackbar, int event) {
                                // Event handler for when the given Snackbar has been dismissed
                            }
                        }).build();

        Dexter.withActivity(this)
                .withPermission(Manifest.permission.ACCESS_FINE_LOCATION)
                .withListener(snackbarPermissionListener)
                .check();

        ButterKnife.bind(this);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        setUpViewPager();
    }

    private void setUpViewPager() {
        TabLayout tabLayout = (TabLayout) findViewById(R.id.tabs);
        tabLayout.setupWithViewPager(viewPager);

        SectionsPagerAdapter sectionsPagerAdapter = new SectionsPagerAdapter(getSupportFragmentManager());
        sectionsPagerAdapter.addFragment(new ScannerFragment(), getString(R.string.scanner));
       // sectionsPagerAdapter.addFragment(new EventLoggerFragment(), getString(R.string.event_log));
        viewPager.setAdapter(sectionsPagerAdapter);
    }

    @Override
    public void onPause() {
        super.onPause();
        //BTUtils.stopScanning(this);
    }
    private class SectionsPagerAdapter extends FragmentPagerAdapter {
        private final List<Fragment> fragmentList = new ArrayList<>();
        private final List<String> fragmentTitleList = new ArrayList<>();

         void addFragment(Fragment fragment, String title) {
            fragmentList.add(fragment);
            fragmentTitleList.add(title);
        }

        SectionsPagerAdapter(FragmentManager fm) {
            super(fm);
        }

        @Override
        public Fragment getItem(int position) {return fragmentList.get(position); }

        @Override
        public int getCount() { return fragmentList.size(); }

        @Override
        public CharSequence getPageTitle(int position) { return fragmentTitleList.get(position); }
    }
}
