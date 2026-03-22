# Dynamic Instrumentation Basics

When analyzing mobile applications, static analysis only gives you half the picture. To truly understand what an application does at runtime, we need **dynamic instrumentation**.

Frida is one of the most powerful tools for this job.

## What is Frida?

Frida is an open-source dynamic code instrumentation toolkit. It lets you inject snippets of JavaScript or your own library into native apps on Windows, macOS, GNU/Linux, iOS, Android, and QNX. It is extensively used by security researchers and reverse engineers.

> [!TIP]
> Always run your tests on a dedicated physical device or an isolated emulator. Real malware can and will escape sandbox detections if you are not careful.

## Writing Your First Hook

Let's say we want to bypass a simple rooted-device detection check in an Android App. If the application has a class named `com.example.security.Detector` with a method `isRooted()`, we can hook it and force it to return false.

Here's the quick Frida script:

```javascript
Java.perform(function() {
    // 1. Get a reference to the class
    var SecurityDetector = Java.use("com.example.security.Detector");

    // 2. Overload the specific method
    SecurityDetector.isRooted.implementation = function() {
        console.log("[*] isRooted() called! Bypassing...");
        
        // 3. Force the app to think the device is secure
        return false; 
    };
});
```

### Running the Script

Once you've connected to your Android device via `adb` and the frida-server is running natively, you can attach to the process:

```bash
frida -U -f com.example.vulnerableapp -l bypass_root.js --no-pause
```

## Why This Matters

This is just scratching the surface. With these techniques you can:
- **Bypass SSL Pinning** to intercept network traffic using Burp Suite.
- **Trace Crypto Functions** to find hardcoded AES endpoints.
- **Modify Game Memory** for bug hunting and exploits.

The sky is the limit once you have execution control inside a running process space!
