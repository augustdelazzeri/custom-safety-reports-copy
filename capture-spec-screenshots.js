const { chromium } = require('playwright');
const path = require('path');

async function captureSpecScreenshots() {
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 500 // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2 // Retina display quality
  });
  
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000';
  const screenshotsDir = path.join(__dirname, 'docs/screenshots/spec');

  console.log('🎬 Starting Specification Screenshots Capture...\n');
  console.log('📐 Viewport: 1440x900 (Desktop Standard)\n');

  try {
    // ===== 1. User Management Overview =====
    console.log('📸 1/9: User Management List Overview...');
    await page.goto(`${baseUrl}/settings/people`);
    await page.waitForTimeout(2500);
    
    // Ensure we're on the Users tab
    await page.click('button:has-text("Users")').catch(() => {});
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'user_management_list_overview.png'),
      fullPage: false
    });
    console.log('✅ Saved: user_management_list_overview.png\n');

    // ===== 2. Invite User Modal =====
    console.log('📸 2/9: Invite User Modal...');
    await page.goto(`${baseUrl}/settings/people`);
    await page.waitForTimeout(2000);
    
    // Click Add User button
    await page.click('button:has-text("Add User")');
    await page.waitForTimeout(1000);
    
    // Partially fill form
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'invite_user_modal.png'),
      fullPage: false
    });
    console.log('✅ Saved: invite_user_modal.png\n');
    
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // ===== 3. Roles List Overview =====
    console.log('📸 3/9: Roles List Overview (System vs Custom badges)...');
    await page.goto(`${baseUrl}/settings/custom-roles`);
    await page.waitForTimeout(2500);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'roles_list_overview.png'),
      fullPage: false
    });
    console.log('✅ Saved: roles_list_overview.png\n');

    // ===== 4. Badge Distinction Zoom =====
    console.log('📸 4/9: Role Badge Comparison Zoom...');
    // Stay on same page, crop to table area showing badges
    await page.waitForTimeout(500);
    
    // Find table and crop to role name column area
    const tableElement = await page.locator('table').boundingBox();
    if (tableElement) {
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'role_badge_comparison_zoom.png'),
        clip: {
          x: tableElement.x,
          y: tableElement.y + 50, // Skip header
          width: 600, // Just first few columns
          height: 300 // First few rows
        }
      });
    } else {
      // Fallback: screenshot with default crop
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'role_badge_comparison_zoom.png'),
        clip: { x: 280, y: 200, width: 600, height: 300 }
      });
    }
    console.log('✅ Saved: role_badge_comparison_zoom.png\n');

    // ===== 5. Role Creation - Step 1: Identity =====
    console.log('📸 5/9: Create Role - Step 1 (Identity with Description)...');
    
    // Go to Custom Roles page directly
    await page.goto(`${baseUrl}/settings/custom-roles`);
    await page.waitForTimeout(2000);
    
    // Click Create Role button
    await page.click('button:has-text("Create Role"), button:has-text("New Role")');
    await page.waitForTimeout(1500);
    
    // Try multiple selectors for role name input
    const roleNameInput = page.locator('input[name="roleName"], input[name="name"], input[placeholder*="name" i]').first();
    await roleNameInput.waitFor({ timeout: 5000 }).catch(() => {});
    await roleNameInput.fill('Contractor Safety Lead').catch(() => {
      console.log('⚠️  Could not fill role name with first selector, trying alternative...');
    });
    
    // Alternative: find any visible input in modal
    if (await roleNameInput.count() === 0) {
      const anyInput = page.locator('input[type="text"]').first();
      await anyInput.fill('Contractor Safety Lead');
    }
    await page.waitForTimeout(300);
    
    // Fill description field
    const descriptionField = page.locator('textarea').first();
    const descExists = await descriptionField.count() > 0;
    if (descExists) {
      await descriptionField.fill('Limited access for external safety auditors.');
      await page.waitForTimeout(500);
    } else {
      console.log('⚠️  Description field not found');
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'create_role_step1_identity.png'),
      fullPage: false
    });
    console.log('✅ Saved: create_role_step1_identity.png\n');

    // ===== 6. Role Creation - Step 2: Matrix =====
    console.log('📸 6/9: Create Role - Step 2 (Permission Matrix)...');
    
    // Scroll down to see permission matrix
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);
    
    // Toggle some permissions ON and OFF
    const toggles = await page.locator('input[type="checkbox"]').all();
    if (toggles.length > 0) {
      // Toggle first few
      for (let i = 0; i < Math.min(3, toggles.length); i++) {
        await toggles[i].click().catch(() => {});
        await page.waitForTimeout(200);
      }
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'create_role_step2_matrix.png'),
      fullPage: false
    });
    console.log('✅ Saved: create_role_step2_matrix.png\n');

    // Close modal first
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // ===== 7. CMMS Integration Indicator =====
    console.log('📸 7/9: CMMS Integration Indicator with Tooltip...');
    
    // Re-open role creation to see CMMS badges
    await page.click('button:has-text("Create Role"), button:has-text("New Role")');
    await page.waitForTimeout(1500);
    
    // Scroll to permissions section
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    
    // Find CMMS badge within the modal/page (not the one in header)
    const cmmsBadge = page.locator('.group span:has-text("CMMS")').first();
    const badgeExists = await cmmsBadge.count() > 0;
    
    if (badgeExists) {
      console.log('✅ CMMS badge found, hovering...');
      await cmmsBadge.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await cmmsBadge.hover({ force: true });
      await page.waitForTimeout(1500); // Wait for tooltip
      
      // Get badge position for cropping
      const badgeBox = await cmmsBadge.boundingBox();
      if (badgeBox) {
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'cmms_indicator_tooltip.png'),
          clip: {
            x: Math.max(0, badgeBox.x - 100),
            y: Math.max(0, badgeBox.y - 50),
            width: 600,
            height: 300
          }
        });
      } else {
        // Fallback full screenshot
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'cmms_indicator_tooltip.png'),
          fullPage: false
        });
      }
    } else {
      console.log('⚠️  CMMS badge not found in permissions, taking full screenshot...');
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'cmms_indicator_tooltip.png'),
        fullPage: false
      });
    }
    console.log('✅ Saved: cmms_indicator_tooltip.png\n');
    
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // ===== 8. Role Detail View =====
    console.log('📸 8/9: Role Detail View...');
    
    // Go back to Custom Roles list
    await page.goto(`${baseUrl}/settings/custom-roles`);
    await page.waitForTimeout(2500);
    
    // Click on first custom role to view details (if modal opens)
    // Or click Edit button
    const editButton = page.locator('button:has-text("Edit")').first();
    const editExists = await editButton.count() > 0;
    
    if (editExists) {
      await editButton.click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'role_detail_view.png'),
        fullPage: false
      });
    } else {
      // Try clicking on role name
      const roleRow = page.locator('table tbody tr').first();
      await roleRow.click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'role_detail_view.png'),
        fullPage: false
      });
    }
    console.log('✅ Saved: role_detail_view.png\n');

    // ===== 9. Critical Warning Banner =====
    console.log('📸 9/9: Role Edit Warning Banner...');
    console.log('ℹ️  Note: This requires editing a role assigned to active users.');
    console.log('ℹ️  If warning doesn\'t appear, mock data may need adjustment.\n');
    
    // Stay in edit mode or navigate to edit a role with users
    // The warning should be visible at the top
    await page.waitForTimeout(1000);
    
    // Scroll to top to ensure banner is visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Check if warning banner exists
    const warningBanner = page.locator('div:has-text("Warning"), div:has-text("active users")');
    const warningExists = await warningBanner.count() > 0;
    
    if (warningExists) {
      console.log('✅ Warning banner found!');
    } else {
      console.log('⚠️  Warning banner not visible - may need to edit role assigned to active users');
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'role_edit_warning_banner.png'),
      fullPage: false
    });
    console.log('✅ Saved: role_edit_warning_banner.png\n');

    console.log('\n✨ All specification screenshots captured successfully!');
    console.log(`📁 Location: ${screenshotsDir}\n`);
    
    console.log('📋 Summary:');
    console.log('1. ✅ User Management List Overview');
    console.log('2. ✅ Invite User Modal');
    console.log('3. ✅ Roles List Overview');
    console.log('4. ✅ Badge Comparison Zoom');
    console.log('5. ✅ Create Role - Identity (with Description)');
    console.log('6. ✅ Create Role - Permission Matrix');
    console.log('7. ✅ CMMS Integration Indicator');
    console.log('8. ✅ Role Detail View');
    console.log('9. ✅ Role Edit Warning Banner');
    console.log('\n🎯 Screenshots ready for Functional Specification Document!');

  } catch (error) {
    console.error('\n❌ Error capturing screenshots:', error);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Execute
captureSpecScreenshots().catch(console.error);
