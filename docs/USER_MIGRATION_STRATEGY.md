# User Migration Strategy: MySQL to Supabase Auth

## Current Situation
You have existing users in MySQL with email/password authentication, and you're migrating to Supabase Auth for better security and features.

## The Challenge
**Existing user passwords in MySQL cannot directly work with Supabase Auth** because:
- Supabase uses its own authentication system
- Password hashes are incompatible between systems
- Security protocols are different

## Migration Options

### Option 1: Password Reset for All Users (Recommended)
**Pros:**
- Simple and secure
- Forces users to create strong passwords
- Clean break from old system
- No security risks

**Implementation:**
1. Import all user data with `.imported` email suffix
2. Send migration emails to all users
3. Users click reset link to set new password in Supabase
4. Automatically link their Supabase account to existing member profile

**Steps:**
```bash
# 1. Run data import (adds .imported to emails)
export SUPABASE_SERVICE_ROLE_KEY=your_service_key
node scripts/complete-data-import.js

# 2. Send migration emails to users
node scripts/send-migration-emails.js
```

### Option 2: Dual Authentication (Temporary)
Keep both systems running during transition:
- New users: Supabase Auth
- Existing users: Option to migrate or use old system
- Gradually migrate users over time

### Option 3: Password Import (Complex, Not Recommended)
Attempt to import password hashes - requires custom auth functions and is risky.

## Recommended Implementation Plan

### Phase 1: Data Import ✅
- [x] Import members with offset member_ids
- [x] Import images, likes, messages
- [x] Add `.imported` suffix to emails

### Phase 2: Migration Communication 📧
```javascript
// scripts/send-migration-emails.js
const nodemailer = require('nodemailer');

async function sendMigrationEmails() {
  const { data: members } = await supabase
    .from('members')
    .select('email, name')
    .like('email', '%.imported');
    
  for (const member of members) {
    const originalEmail = member.email.replace('.imported', '');
    await sendEmail(originalEmail, member.name);
  }
}
```

### Phase 3: User Onboarding Flow 🔄
1. User visits site with original email
2. System detects existing `.imported` profile
3. Prompts password reset to claim account
4. Links Supabase user to existing member profile

### Phase 4: Account Linking 🔗
When user completes Supabase signup with original email:
```javascript
// Auto-link existing profile
const existingMember = await supabase
  .from('members')
  .select('*')
  .eq('email', user.email + '.imported')
  .single();

if (existingMember) {
  await supabase
    .from('members')
    .update({ 
      user_id: user.id,
      email: user.email  // Remove .imported suffix
    })
    .eq('id', existingMember.id);
}
```

## Timeline
- **Week 1**: Complete data import
- **Week 2**: Build migration flow in app
- **Week 3**: Send migration emails to users
- **Week 4**: Monitor and support user migration

## Success Metrics
- % of users who successfully migrate
- User retention post-migration
- Support ticket volume
- Time to complete migration

## Rollback Plan
- Keep MySQL database as backup
- Can revert to old auth system if needed
- Export Supabase data back to MySQL if required

## Next Steps
1. ✅ Run complete data import
2. 🔧 Build migration detection in frontend
3. 📧 Create migration email templates
4. 🔗 Implement automatic account linking
5. 📊 Set up migration tracking