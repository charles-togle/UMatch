# Google People API Integration Instructions

## Current Issue
The Google People API requires an **access token** to work, but your current auth flow only stores the **ID token** (JWT) in Supabase. The ID token is used for authentication, but the access token is needed for API calls.

## Solution Overview
You have two options:

### Option 1: Store Provider Token in Supabase (Recommended)
Modify your authentication flow to also pass and store the Google **access token** (provider token) when users sign in.

#### Changes needed in Auth.tsx:

**For Native (Capacitor):**
```typescript
// In handleSocialLogin function, after line 81:
const result = res.result as GoogleLoginResponse
if ('profile' in result && 'idToken' in result) {
  const { name, email, imageUrl } = result.profile

  // CHANGE THIS: Also pass the accessToken
  const { user, error } = await getOrRegisterAccount({
    googleIdToken: result.idToken || '',
    googleAccessToken: result.accessToken?.token || '', // ADD THIS
    email: email || '',
    user_name: toSentenceCaseFull(name || 'New User'),
    profile_picture_url: imageUrl || '',
    user_type: 'User'
  })
}
```

**For Web:**
```typescript
// In handleGoogleSuccess function, you need to get BOTH tokens
// Unfortunately, @react-oauth/google only provides ID token
// You need to switch to a different library or use Google Identity Services directly

// Option: Use Google Identity Services for both ID and access tokens
const handleGoogleSuccess = async () => {
  const client = google.accounts.oauth2.initCodeClient({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: 'openid email profile https://www.googleapis.com/auth/contacts.readonly',
    ux_mode: 'popup',
    callback: async (response) => {
      // Exchange authorization code for tokens on your backend
      // or use the tokens directly
    }
  })
  client.requestCode()
}
```

#### Changes needed in authServices.tsx:

```typescript
export interface GoogleProfile {
  googleIdToken: string
  googleAccessToken?: string // ADD THIS
  email: string
  user_name: string
  user_type?: UserType
  profile_picture_url?: string
}

// In GetOrRegisterAccount function:
const { data: signInData, error: signInError } =
  await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: profile.googleIdToken,
    access_token: profile.googleAccessToken, // ADD THIS
    options: {
      // This tells Supabase to store the provider token
    }
  })
```

### Option 2: Request New Access Token in AddStaff (Current Approach)
This is what I implemented, but it has a limitation: it creates a separate OAuth flow that's disconnected from your main auth.

**Pros:**
- Simpler to implement
- No changes to existing auth flow

**Cons:**
- User has to authenticate twice (once for app, once for contacts)
- Extra OAuth popup
- Tokens are not persisted

## Recommended Approach

I recommend **Option 1** because:
1. User only authenticates once
2. Access token is available throughout the app
3. No extra OAuth popups
4. Token is automatically refreshed by Supabase

## Implementation Steps for Option 1:

1. **Update GoogleProfile interface** in `authServices.tsx` to include `googleAccessToken`

2. **Update Auth.tsx** to pass the access token:
   - For native: Extract `result.accessToken?.token` from Google Login response
   - For web: Switch to Google Identity Services OAuth2 code flow

3. **Update authServices.tsx** to pass access_token to Supabase

4. **Update AddStaff.tsx** (already done) to retrieve token from session

5. **Test** that `session.provider_token` contains the access token

## Additional Notes

- The access token expires after 1 hour
- Supabase should handle token refresh automatically if you configured it correctly
- Make sure your Google Cloud Console project has the People API enabled
- Add `https://www.googleapis.com/auth/contacts.readonly` to the scopes during sign-in

## Testing

After implementation, verify:
```typescript
const { data: { session } } = await supabase.auth.getSession()
console.log('Provider Token:', session?.provider_token) // Should not be null
```

If `provider_token` is null, the access token wasn't stored during sign-in.
