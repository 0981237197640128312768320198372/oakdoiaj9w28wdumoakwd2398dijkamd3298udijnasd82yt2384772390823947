# Mandatory LINE Verification System for Seller Registration

## Overview

This document outlines the implementation of a mandatory LINE verification system that prevents
seller account creation until successful verification is completed.

## Key Changes Made

### 1. **New Pending Registration Model** (`models/v3/PendingRegistration.ts`)

- Created a temporary storage system for registration data
- Stores all seller information before verification
- Includes TTL (Time To Live) for automatic cleanup
- Prevents database pollution with unverified accounts

### 2. **Modified Registration API** (`app/api/v3/seller/register/route.ts`)

- **BREAKING CHANGE**: No longer creates seller accounts immediately
- Creates pending registration record instead
- Returns verification code and pending ID
- Includes clear warning about mandatory verification

### 3. **Enhanced LINE Webhook** (`app/api/v3/line/webhook/route.ts`)

- Handles pending registration verification
- Creates actual seller account only after successful LINE verification
- Automatically cleans up pending registration after account creation
- Maintains existing functionality for already verified sellers

### 4. **Updated Frontend** (`components/public/store/RegisterSellerPage.tsx`)

- Added mandatory verification warning
- Updated TypeScript interfaces for new response format
- Clear messaging that account creation depends on verification
- Improved user experience with verification status tracking

## New Flow

### Before (Problem)

1. User submits registration form
2. ✅ Seller account created in database
3. Verification code generated
4. User may or may not verify
5. ❌ Unverified accounts exist in database

### After (Solution)

1. User submits registration form
2. ⏳ Pending registration created (NOT seller account)
3. Verification code generated
4. **User MUST verify via LINE**
5. ✅ Only after verification → Seller account created
6. 🧹 Pending registration cleaned up

## Benefits

### ✅ **True Mandatory Verification**

- No way to bypass or skip verification
- Account creation is completely blocked without verification

### ✅ **Clean Database**

- No orphaned/unverified seller records
- Automatic cleanup of expired pending registrations

### ✅ **Better Security**

- Ensures all sellers have valid LINE accounts
- Prevents spam registrations

### ✅ **No API Spamming**

- Single webhook handles all verification logic
- Efficient processing without multiple API calls

## Technical Implementation

### Database Schema

```typescript
// Pending Registration (Temporary)
{
  username: string,
  email: string,
  password: string, // hashed
  contact: ContactData,
  store: StoreData,
  verification: {
    code: string,
    expiresAt: Date,
    attempts: number
  },
  lineUserId?: string,
  expiresAt: Date // TTL for cleanup
}

// Seller (Only created after verification)
{
  // ... existing seller fields
  verification: {
    status: 'verified', // Always verified
    verifiedAt: Date,
    // ...
  }
}
```

### API Responses

```typescript
// Registration Response (New)
{
  message: "Registration initiated. Please verify your LINE account to complete registration.",
  verificationCode: "ABC123",
  expiresAt: "2024-01-01T12:00:00Z",
  requiresLineVerification: true,
  pendingId: "pending_registration_id",
  warning: "Account will only be created after successful LINE verification."
}
```

### Verification Process

1. **Registration**: Creates pending record, returns verification code
2. **LINE Message**: User sends code to LINE bot
3. **Webhook Processing**:
   - Finds pending registration by code
   - Creates actual seller account
   - Cleans up pending registration
   - Sends success message

## Error Handling

### Expired Verification

- Pending registrations auto-expire after 30 minutes
- TTL index automatically removes expired records
- Users must restart registration process

### Failed Verification

- Invalid codes return error message
- No account creation occurs
- Pending registration remains until expiry

### Duplicate Registrations

- Checks for existing sellers with same email/username
- Removes any existing pending registration for retry
- Prevents conflicts between pending and actual accounts

## Migration Notes

### Backward Compatibility

- Existing verified sellers remain unaffected
- Old verification codes still work for already created accounts
- No data migration required

### Frontend Changes

- Registration flow now includes mandatory verification step
- Clear messaging about verification requirement
- Updated TypeScript interfaces

## Security Considerations

### Data Protection

- Passwords are hashed before storing in pending registrations
- Sensitive data automatically cleaned up after verification
- TTL prevents long-term storage of unverified data

### Verification Security

- Verification codes have expiration times
- Limited verification attempts
- Secure LINE webhook signature validation

## Monitoring & Maintenance

### Cleanup

- Automatic cleanup via MongoDB TTL indexes
- No manual intervention required
- Prevents database bloat

### Logging

- All verification attempts logged
- Pending registration creation/cleanup tracked
- Error handling with detailed logging

## Testing Recommendations

1. **Test Registration Flow**

   - Verify pending registration creation
   - Confirm no seller account created initially

2. **Test Verification**

   - Valid code creates seller account
   - Invalid code returns error
   - Expired code prevents account creation

3. **Test Cleanup**

   - Expired pending registrations removed
   - Successful verification cleans up pending record

4. **Test Edge Cases**
   - Duplicate email/username handling
   - Network failures during verification
   - Concurrent verification attempts

## Conclusion

The mandatory verification system ensures that:

- ✅ **No accounts are created without verification**
- ✅ **Database remains clean and organized**
- ✅ **Security is enhanced through verified LINE accounts**
- ✅ **User experience is clear and guided**

This implementation provides a robust, secure, and user-friendly verification system that prevents
spam and ensures all sellers have valid LINE accounts.
