# LINE Duplicate Protection System

## Overview

This system implements comprehensive protection against duplicate LINE accounts and LINE IDs in the
seller registration process. It prevents both contact LINE ID duplication and LINE User ID reuse
across multiple accounts.

## 🛡️ Protection Layers

### 1. **Contact LINE ID Protection** (`contact.line`)

- **What it protects**: The `@username` LINE ID that users enter during registration
- **Scope**: Prevents multiple sellers from claiming the same LINE contact ID
- **Example**: If User A registers with `@johndoe`, User B cannot register with the same `@johndoe`

### 2. **LINE User ID Protection** (`lineUserId`)

- **What it protects**: The internal LINE User ID from webhook (e.g.,
  `U29bcda65594a6b00e4215cf03bef3351`)
- **Scope**: Prevents the same LINE account from verifying multiple seller registrations
- **Example**: If LINE account `U123456` verifies Store A, it cannot verify Store B

## 🔧 Implementation Details

### Database Schema Changes

#### Seller Model (`models/v3/Seller.ts`)

```typescript
contact: {
  line: {
    type: String,
    default: null,
    sparse: true,    // NEW: Allows null values
    unique: true,    // NEW: Prevents duplicates
    index: true,
  }
},
lineUserId: {
  type: String,
  default: null,
  sparse: true,      // NEW: Allows null values
  unique: true,      // NEW: Prevents duplicates
  index: true,
}
```

#### PendingRegistration Model (`models/v3/PendingRegistration.ts`)

```typescript
// Same unique constraints as Seller model
contact: {
  line: { sparse: true, unique: true, index: true }
},
lineUserId: { sparse: true, unique: true, index: true }
```

### Registration API Protection (`app/api/v3/seller/register/route.ts`)

#### Duplicate LINE ID Check

```typescript
// Check for duplicate LINE ID in existing sellers
if (contact?.line) {
  const existingSellerWithLineId = await Seller.findOne({
    'contact.line': contact.line,
  });

  if (existingSellerWithLineId) {
    return NextResponse.json(
      {
        error: `This LINE ID (${contact.line}) is already registered with another account`,
      },
      { status: 400 }
    );
  }
}
```

#### Enhanced Pending Registration Check

```typescript
// Check for existing pending registration with same email, username, or LINE ID
const existingPending = await PendingRegistration.findOne({
  $or: [{ email }, { username }, ...(contact?.line ? [{ 'contact.line': contact.line }] : [])],
});

if (existingPending) {
  // Allow retry for same user, block for different users with same LINE ID
  if (existingPending.email === email || existingPending.username === username) {
    await PendingRegistration.deleteOne({ _id: existingPending._id });
  } else if (contact?.line && existingPending.contact?.line === contact.line) {
    return NextResponse.json(
      {
        error: `This LINE ID (${contact.line}) is already being used in another pending registration`,
      },
      { status: 400 }
    );
  }
}
```

### Webhook Protection (`app/api/v3/line/webhook/route.ts`)

#### LINE User ID Verification Check

```typescript
// Check if this LINE User ID has already been used for verification
const existingVerifiedSeller = await Seller.findOne({ lineUserId: userId });
if (existingVerifiedSeller) {
  await LineService.sendReplyMessage(
    replyToken,
    `This LINE account has already been used to verify the store "${existingVerifiedSeller.store.name}". Each LINE account can only be used once for verification.`
  );
  return;
}

// Check if this LINE User ID is already being used in another pending registration
const existingPendingWithLineUser = await PendingRegistration.findOne({
  lineUserId: userId,
});
if (existingPendingWithLineUser) {
  await LineService.sendReplyMessage(
    replyToken,
    'This LINE account is already being used for another registration process. Please complete that registration first or contact support.'
  );
  return;
}
```

#### LINE User ID Claiming

```typescript
// Update pending registration with LINE User ID to claim it
await PendingRegistration.updateOne({ _id: pendingRegistration._id }, { lineUserId: userId });
```

## 🎯 Protection Scenarios

### Scenario 1: Duplicate Contact LINE ID

```
✅ User A registers with email: user1@test.com, LINE ID: @johndoe
❌ User B tries to register with email: user2@test.com, LINE ID: @johndoe
Result: "This LINE ID (@johndoe) is already registered with another account"
```

### Scenario 2: Duplicate LINE User ID (Same Person, Different Registration)

```
✅ User A starts registration with LINE account U123456, gets verification code
❌ User A starts new registration with different email, same LINE account tries to verify
Result: "This LINE account is already being used for another registration process"
```

### Scenario 3: Duplicate LINE User ID (Different Person)

```
✅ User A completes registration and verifies with LINE account U123456
❌ User B tries to verify their registration with same LINE account U123456
Result: "This LINE account has already been used to verify the store 'Store A'. Each LINE account can only be used once for verification."
```

### Scenario 4: Same Person Retry (Allowed)

```
✅ User A starts registration with email: user@test.com, LINE ID: @johndoe
✅ User A abandons process, starts new registration with same email and LINE ID
Result: Old pending registration cleaned up, new registration allowed
```

## 🚨 Error Messages

### Registration API Errors

- `"This LINE ID (@username) is already registered with another account"`
- `"This LINE ID (@username) is already being used in another pending registration"`

### Webhook Errors

- `"This LINE account has already been used to verify the store 'StoreName'. Each LINE account can only be used once for verification."`
- `"This LINE account is already being used for another registration process. Please complete that registration first or contact support."`

## 🔍 Database Indexes

### Unique Indexes Created

```javascript
// Seller collection
{ "contact.line": 1 } // sparse, unique
{ "lineUserId": 1 }    // sparse, unique

// PendingRegistration collection
{ "contact.line": 1 } // sparse, unique
{ "lineUserId": 1 }    // sparse, unique
```

### Existing Indexes (Enhanced)

```javascript
// Compound indexes for efficient queries
{ "verification.code": 1, "verification.expiresAt": 1 }
{ "email": 1, "username": 1 }
```

## 🛠️ Migration Considerations

### Before Deployment

1. **Check for existing duplicates** in production database
2. **Handle edge cases** where duplicates already exist
3. **Test unique constraint creation** on existing data

### Potential Issues

- **Existing duplicate LINE IDs** may prevent index creation
- **Null values** are handled by sparse indexes
- **Case sensitivity** - LINE IDs are case-sensitive

## 🧪 Testing Scenarios

### Test Cases to Verify

1. ✅ Normal registration flow works
2. ❌ Duplicate contact LINE ID blocked at registration
3. ❌ Duplicate LINE User ID blocked at verification
4. ✅ Same user retry allowed
5. ❌ Different user with same LINE ID blocked
6. ✅ Rate limiting still works
7. ✅ Webhook optimization still works

## 📊 Monitoring

### Log Messages to Monitor

- `"LINE User ID {userId} already used for verification by seller: {username}"`
- `"LINE User ID {userId} already being used in pending registration: {username}"`
- `"This LINE ID ({lineId}) is already registered with another account"`

### Metrics to Track

- Number of duplicate LINE ID attempts
- Number of duplicate LINE User ID attempts
- Registration success rate after implementation
- Verification success rate after implementation

## 🔐 Security Benefits

1. **Prevents account farming** - One person can't create multiple verified stores
2. **Ensures identity integrity** - Each LINE account represents one verified seller
3. **Reduces fraud potential** - Harder to create fake verified accounts
4. **Maintains verification trust** - LINE verification becomes meaningful
5. **Prevents confusion** - Clear ownership of LINE accounts per store

## 🚀 Future Enhancements

1. **Admin override system** - Allow admins to manually resolve duplicate issues
2. **LINE ID transfer system** - Allow transferring LINE ID between accounts (with verification)
3. **Bulk duplicate resolution** - Tools for handling existing duplicates
4. **Enhanced error messages** - More specific guidance for users
5. **Analytics dashboard** - Track duplicate prevention effectiveness
