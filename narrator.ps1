Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoiceByHints('Female')
$synth.Rate = 1

Write-Host "Starting Narration in 3 seconds. Start your screen recorder now!"
Start-Sleep -Seconds 3

$lines = @(
    "Hello Judges! Welcome to CERTIFY.",
    "Since Round 1, we have completely transformed our platform from a local mockup into a production-ready application.",
    "We migrated from local storage to a robust Supabase PostgreSQL database, integrated strict Row-Level Security, and deployed globally on the Vercel Edge Network. Let me show you the live app.",
    
    "We built this for real-world scale.",
    "Here in the Issuer dashboard, administrators don't have to issue certificates one-by-one.",
    "Using CSV batch parsing and high-concurrency database inserts, we can cryptographically sign and mint hundreds of credentials simultaneously. Once issued, they appear instantly in the student's digital wallet.",
    
    "Security is our core innovation. We don't just generate a PDF.",
    "Every single credential is mathematically sealed using the WebCrypto API with an RSA-PSS signature.",
    "The JSON payload is cryptographically tied to the issuer's private key. If a student tries to alter their grade or name by even a single pixel, the signature validation mathematically fails, making forgery impossible.",
    
    "We engineered three stunning CSS-art themes: Classic, Brutalist, and Avant-Garde, that maintain our sleek dark-mode aesthetic perfectly.",
    "We also built for real-world edge cases: native mobile scanning. Employers don't need to download an app; they just scan this QR code with their phone camera, and the cryptographic verification is handled instantly and statelessly in their mobile browser.",
    
    "CERTIFY is infinitely scalable, cryptographically secure, and beautifully designed.",
    "Thank you for reviewing our Round 2 submission."
)

foreach ($line in $lines) {
    Write-Host "Speaking: $line"
    $synth.Speak($line)
    Start-Sleep -Milliseconds 500
}
