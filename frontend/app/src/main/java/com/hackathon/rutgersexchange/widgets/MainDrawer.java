package com.hackathon.rutgersexchange.widgets;

import android.app.Fragment;
import android.os.Bundle;

import com.hackathon.rutgersexchange.R;

import it.neokree.materialnavigationdrawer.MaterialNavigationDrawer;
import it.neokree.materialnavigationdrawer.elements.MaterialAccount;
import it.neokree.materialnavigationdrawer.elements.MaterialSection;
import it.neokree.materialnavigationdrawer.elements.listeners.MaterialSectionListener;

/**
 * Created by patrick on 10/3/15.
 */
public class MainDrawer extends MaterialNavigationDrawer implements MaterialSectionListener{

    Fragment targetFrag1, targetFrag2, targetFrag3, targetFrag4;

    @Override
    public void init (Bundle bundle) {
        MaterialSection materialSection1, materialSection2, materialSection3, materialSection4, accountSection, bottomSection;
        materialSection1 = newSection(getString(R.string.drawer_menu_1_title), targetFrag1);
        materialSection2 = newSection(getString(R.string.drawer_menu_2_title), targetFrag2);
        materialSection3 = newSection(getString(R.string.drawer_menu_3_title), targetFrag3);
        materialSection4 = newSection(getString(R.string.drawer_menu_4_title), targetFrag4);
        accountSection = null;
        bottomSection = null;
        this.addAccountSection(accountSection);
        this.addSection(materialSection1);
        this.addDivisor();
        this.addSection(materialSection2);
        this.addDivisor();
        this.addSection(materialSection3);
        this.addDivisor();
        this.addSection(materialSection4);
        this.addBottomSection(bottomSection);
    }
}
