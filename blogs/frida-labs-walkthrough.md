If you've ever stared at an Android APK wondering what's happening under the hood, Frida is the tool that makes it all visible. It's a dynamic instrumentation framework that lets you inject JavaScript into running processes, hook Java methods, intercept native functions, and generally poke around in ways the app developer definitely didn't intend. This post walks through the [DERE-ad2001/Frida-Labs](https://github.com/DERE-ad2001/Frida-Labs/) challenge series, covering all eleven challenges from basic method hooking all the way to patching ARM64 assembly at runtime. Each challenge teaches a distinct Frida technique, and by the end you'll have a solid mental model for approaching real Android targets.

---

## Setting Up Your Environment

Before anything else, get the toolchain sorted. Skipping this step carefully is how you lose two hours to "why isn't Frida connecting."

**What you need:**

- Python 3.8+ (3.11 recommended)
- ADB installed and on your PATH
- An Android emulator or rooted device
- JADX for static analysis

**Install Frida:**

```bash
pip install frida-tools
```

Verify the install:

```bash
frida --version
```

**Push the Frida server to your device.** Download the correct `frida-server` binary from the [Frida releases page](https://github.com/frida/frida/releases). Match the version exactly to your `frida-tools` version and pick the right architecture (use `x86_64` for most emulators, `arm64` for physical devices):

```bash
adb push frida-server-16.x.x-android-x86_64 /data/local/tmp/frida-server
adb shell chmod +x /data/local/tmp/frida-server
adb shell /data/local/tmp/frida-server &
```

Confirm the connection from your host:

```bash
frida-ps -U
```

If you see a list of running processes, you're good. If it hangs, the server isn't running or there's an ADB USB/network issue.

**Install JADX** from [github.com/skylot/jadx](https://github.com/skylot/jadx/releases) and use the GUI version (`jadx-gui`) for browsing decompiled apps.

The general command to spawn and hook an app from the start is:

```bash
frida -U -f com.example.package -l script.js --no-pause
```

Use `-f` to spawn fresh (recommended) and `--no-pause` to let it run immediately.

---

## A Reusable Script Template

Every challenge uses the same skeleton. The `setTimeout` wrapper ensures the Java bridge is ready before your hooks fire:

```javascript
const DELAY = 1000;
setTimeout(function () {
    Java.perform(function () {
        fridaScript();
    });
}, DELAY);

function fridaScript() {
    console.log("[*] Script started");
    // your logic goes here
}
```

You can layer in a pretty logger on top of this, but the core pattern stays the same throughout the whole series.

---

## 0x1 - Hooking a Method

**Goal:** Bypass a numeric check where the app compares your input against a random number.

Opening the APK in JADX and searching for the "Try again" string leads straight to `MainActivity`. The check logic boils down to something like:

```java
if (input == get_random() * 2 + 4) {
    // success
}
```

Two approaches work here. The cleaner one hooks `check(int, int)` directly and rewrites the second argument on the fly:

```javascript
function fridaScript() {
    var MA = Java.use("com.ad2001.frida0x1.MainActivity");

    MA.check.implementation = function (i, i2) {
        console.log("[*] Original args: i=" + i + ", i2=" + i2);
        i2 = i * 2 + 4;
        console.log("[*] Patched i2 to: " + i2);
        return this.check(i, i2);
    };
}
```

The key line is `this.check(i, i2)` which calls the original implementation with your modified arguments. Always call the original unless you want to completely replace the method body.

**Tip:** If class names are obfuscated, look for the `MAIN/LAUNCHER` activity in `AndroidManifest.xml` to find your entry point.

---

## 0x2 - Calling a Static Method

**Goal:** Trigger `get_flag(int)` which exists in the code but is never called from the UI.

This is common in CTF apps and sometimes real apps too - dead code that still does something interesting. Since it's a static method, you don't need an instance:

```javascript
function fridaScript() {
    var MA = Java.use("com.ad2001.frida0x2.MainActivity");
    MA.get_flag(4919);
}
```

If a method has multiple overloads (same name, different parameter types), specify which one with `.overload()`:

```javascript
MA.get_flag.overload("int").call(MA, 4919);
```

The magic number `4919` comes from reading the decompiled code in JADX.

---

## 0x3 - Changing a Static Field

**Goal:** The app checks `Checker.code == 512`, but the field starts at 0 and only increments through a UI method.

Since `code` is a static field, you can write to it directly without any instance:

```javascript
function fridaScript() {
    var Checker = Java.use("com.ad2001.frida0x3.Checker");
    Checker.code.value = 512;
}
```

Alternatively, if you want to simulate the intended behavior (for testing purposes), call `increase()` enough times:

```javascript
function fridaScript() {
    var Checker = Java.use("com.ad2001.frida0x3.Checker");
    for (var i = 0; i < 256; i++) {
        Checker.increase();
    }
}
```

Both get you to 512. The direct field write is obviously faster.

---

## 0x4 - Creating a Class Instance

**Goal:** Call `Check.get_flag(1337)` where `Check` is a separate class never instantiated by `MainActivity`.

Unlike static methods, `get_flag()` here is an instance method. Use `$new()` to construct the object:

```javascript
function fridaScript() {
    var Check = Java.use("com.ad2001.frida0x4.Check");
    var obj = Check.$new();
    obj.get_flag(1337);
}
```

`$new()` maps to the class constructor. If the constructor takes arguments, pass them inside: `Check.$new(arg1, arg2)`.

---

## 0x5 - Invoking Methods on an Existing Instance

**Goal:** Call `flag(1337)` on the already-running `MainActivity` instance.

You can't use `$new()` for activities because Android has already created the instance. `Java.choose()` scans the heap and finds live instances of any class:

```javascript
function fridaScript() {
    Java.choose("com.ad2001.frida0x5.MainActivity", {
        onMatch: function (instance) {
            instance.flag(1337);
            console.log("[*] flag(1337) called");
        },
        onComplete: function () {},
    });
}
```

`onMatch` fires for each live instance found. In most single-activity apps there's just one, but always be ready for multiple.

---

## 0x6 - Passing an Object as an Argument

**Goal:** Call `get_flag(Checker)` where the method requires a `Checker` object with specific field values (`num1 == 1234`, `num2 == 4321`).

Combine the skills from 0x4 and 0x5 - create the `Checker` instance, set its fields, then find `MainActivity` and call the method:

```javascript
function fridaScript() {
    var Checker = Java.use("com.ad2001.frida0x6.Checker");
    var checkerObj = Checker.$new();
    checkerObj.num1.value = 1234;
    checkerObj.num2.value = 4321;

    Java.choose("com.ad2001.frida0x6.MainActivity", {
        onMatch: function (instance) {
            instance.get_flag(checkerObj);
        },
        onComplete: function () {},
    });
}
```

Field access in Frida always goes through `.value` - reading and writing both.

---

## 0x7 - Hooking a Constructor

**Goal:** The app constructs a `Checker` object with values that fail the flag check. Intercept the constructor and substitute better values.

Constructor hooks use the special `$init` name:

```javascript
function fridaScript() {
    var Checker = Java.use("com.ad2001.frida0x7.Checker");
    Checker.$init.implementation = function (a, b) {
        console.log("[*] Constructor called with: " + a + ", " + b);
        this.$init(600, 600);
    };
}
```

**Watch out:** On some ARM64 devices, overriding `$init` can behave unexpectedly. The reliable fallback is to skip the constructor hook entirely and instead use `Java.choose()` to find the activity, then call the flagging method yourself with a freshly constructed object using your own values.

```javascript
function fridaScript() {
    Java.choose("com.ad2001.frida0x7.MainActivity", {
        onMatch: function (instance) {
            var Checker = Java.use("com.ad2001.frida0x7.Checker");
            var obj = Checker.$new(600, 600);
            instance.flag(obj);
        },
        onComplete: function () {},
    });
}
```

---

## 0x8 - Hooking a Native Function

**Goal:** Hook `strcmp` in `libc.so` to spy on what string the app is comparing your input against.

First, look for `System.loadLibrary("...")` in JADX to identify which native library is in play. Then extract the `.so` from the APK (it's just a zip file) and inspect it with Ghidra or Binary Ninja to understand the native code.

Frida can hook any exported native function by name:

```javascript
function fridaScript() {
    var libc = Process.getModuleByName("libc.so");
    var strcmpAddr = libc.getExportByName("strcmp");

    Interceptor.attach(strcmpAddr, {
        onEnter: function (args) {
            var s1 = args[0].readCString();
            var s2 = args[1].readCString();
            if (s1 === "vishal") {
                console.log('[*] strcmp("' + s1 + '", "' + s2 + '")');
            }
        },
        onLeave: function (retval) {},
    });
}
```

Filtering by a known input string (like the username you enter) cuts through the noise since `strcmp` gets called constantly.

To list all exports of a native module for exploration:

```javascript
var mod = Process.getModuleByName("libfrida0x8.so");
mod.enumerateExports().forEach(function (exp) {
    console.log(exp.name + " @ " + exp.address);
});
```

---

## 0x9 - Overwriting a Native Return Value

**Goal:** The app calls a JNI function that returns an integer result used to check success. Force it to return `1337`.

`Interceptor.attach` supports an `onLeave` callback where `retval` is the actual return value. For integer returns, use `retval.replace()`:

```javascript
function fridaScript() {
    var mod = Process.getModuleByName("liba0x9.so");
    var funcAddr = mod.findExportByName(
        "Java_com_ad2001_a0x9_MainActivity_check_1flag",
    );

    Interceptor.attach(funcAddr, {
        onEnter: function (args) {},
        onLeave: function (retval) {
            console.log("[*] Original return: " + retval);
            retval.replace(1337);
        },
    });
}
```

JNI function names follow a predictable pattern: `Java_` + package name with dots replaced by underscores + `_` + class name + `_` + method name. Special characters in method names become `_1`.

---

## 0x0A - Calling a Native Function Directly

**Goal:** Invoke a native function directly using Frida's `NativeFunction` wrapper.

The easy path is calling the Java-declared native method from the Java layer:

```javascript
function fridaScript() {
    Java.choose("com.ad2001.frida0xa.MainActivity", {
        onMatch: function (instance) {
            var result = instance.stringFromJNI();
            console.log("[*] Result: " + result);
        },
        onComplete: function () {},
    });
}
```

For calling the native function directly (bypassing the Java wrapper), use `NativeFunction`. JNI functions always take a `JNIEnv*` and a `jclass` or `jobject` as their first two arguments:

```javascript
function fridaScript() {
    var addr = Module.findExportByName(
        "libfrida0xa.so",
        "Java_com_ad2001_frida0xa_MainActivity_stringFromJNI",
    );

    var fn = new NativeFunction(addr, "pointer", ["pointer", "pointer"]);
    var env = Java.vm.getEnv();
    var result = fn(env.handle, env.handle);
    console.log("[*] Direct native result: " + Memory.readUtf8String(result));
}
```

Getting the calling convention right here matters. Mismatched argument types will crash the process.

---

## 0x0B - Patching Native Instructions at Runtime

**Goal:** Modify the native binary's machine code at runtime to bypass a conditional check.

This is the most advanced challenge. You're writing actual machine instructions into memory while the process runs. First, find the target function and calculate the offset to the instruction you want to patch. On x86_64, replacing a conditional jump with NOPs looks like:

```javascript
function fridaScript() {
    var func = Module.findExportByName(
        "libfrida0xb.so",
        "Java_com_ad2001_frida0xb_MainActivity_getFlag",
    );

    // Offset 0x1E is where the conditional branch lives - find this in Ghidra
    var patchAddr = func.add(0x1e);

    // Make the memory writable and executable
    Memory.protect(patchAddr, 0x1000, "rwx");

    // Write 6 NOPs (each NOP is 1 byte on x86, 4 bytes on ARM64)
    var writer = new X86Writer(patchAddr);
    for (var i = 0; i < 6; i++) {
        writer.putNop();
    }
    writer.flush();
    writer.dispose();

    console.log("[*] Patch applied");
}
```

For ARM64 targets, swap `X86Writer` for `ARM64Writer` and adjust the NOP count since ARM64 instructions are always 4 bytes.

The offset (`0x1E` above) comes from loading the `.so` into Ghidra, finding the function, and counting bytes from the function start to the branch instruction you want to neutralize. This is where having solid Ghidra skills pays off.

---

## Common Pitfalls Across All Challenges

**Frida server version mismatch.** The server binary on the device must match your host `frida-tools` version exactly. Even a minor version difference causes connection failures. When in doubt, `pip install frida-tools==X.Y.Z` to pin to the same version as your server binary.

**Spawning vs attaching.** Using `-f` (spawn) runs the script before the app starts, which is important when you need to hook something that fires early in the app lifecycle. Using `-n <process>` attaches to an already-running process but may miss early hooks. For most of these challenges, spawn mode is the right call.

**`this.method()` vs `OriginalClass.method.call(this)`**: Inside a hooked implementation, always call the original via `this.originalMethod(args)`. Calling the Java class directly creates a loop. The exception is when you intentionally want to skip the original entirely.

**ARM64 constructor hooking quirks.** As noted in 0x7, hooking `$init` on ARM64 can misbehave. The `Java.choose()` + `$new()` pattern is more portable.

**`readCString()` crashing on null pointers.** When reading native arguments in `onEnter`, always null-check the pointer before calling `readCString()`. `strcmp` and similar functions sometimes get called with null args:

```javascript
onEnter: function (args) {
    if (!args[0].isNull()) {
        console.log(args[0].readCString());
    }
}
```

**Memory not being writable for patches.** If your `X86Writer` or `ARM64Writer` throws an access violation, you forgot to call `Memory.protect()` first. Set the region to `'rwx'` before writing, and consider restoring original protections after flushing.

---

## What's Next

Once you're comfortable with the Frida Labs series, here are a few directions worth exploring:

**Frida with SSL unpinning** - Most production apps implement certificate pinning. There are Frida scripts (like `frida-ios-dump` and various Android unpinning scripts) that hook the trust manager and disable pinning at runtime, letting you intercept HTTPS traffic in Burp Suite.

**Heap spraying and memory inspection** - Frida's `Memory` API lets you scan process memory for patterns, dump heap objects, and trace allocations. Combine this with `Java.choose()` to find objects that aren't referenced by any static field.

**Stalker for code tracing** - Frida's `Stalker` engine traces every instruction a thread executes. It's expensive, but incredibly powerful for understanding complex obfuscated native code without a full debugger.

---

_The Frida-Labs repo lives at [github.com/DERE-ad2001/Frida-Labs](https://github.com/DERE-ad2001/Frida-Labs/) if you want to work through the challenges hands-on alongside this guide._
