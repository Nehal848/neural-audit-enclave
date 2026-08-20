"use client"

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { useState } from "react"

export function GoogleAuthButton({ role, onSuccess, onError }: { role: string, onSuccess: (token: string) => void, onError: (err: string) => void }) {
  // Default placeholder if the user hasn't set NEXT_PUBLIC_GOOGLE_CLIENT_ID yet.
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "PLACEHOLDER_GOOGLE_CLIENT_ID"

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="w-full flex justify-center border border-slate-200 rounded-xl py-1 bg-white hover:bg-slate-50 transition-colors">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              onSuccess(credentialResponse.credential)
            } else {
              onError("No credential received from Google.")
            }
          }}
          onError={() => {
            onError("Google Sign-In failed.")
          }}
          text="continue_with"
          shape="rectangular"
          size="large"
          logo_alignment="center"
        />
      </div>
    </GoogleOAuthProvider>
  )
}
