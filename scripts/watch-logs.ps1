# Clear previous logs and start streaming filtered logs
adb logcat -c
# Stream logs, filtering for React Native, JavaScript errors, and App-specific tags
# Using Select-String (the PS equivalent of grep) to filter for keywords
adb logcat *:S ReactNative:V ReactNativeJS:V AndroidRuntime:E | Select-String -Pattern "StudyOS|React|Error"
