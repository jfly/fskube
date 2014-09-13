## Get yourself set up
1. Download and install Android Studio (https://developer.android.com/sdk/installing/studio.html).
2. You need JDK 6 or greater (https://developer.android.com/sdk/installing/index.html?pkg=studio). I'm using 7 (Android Studio recommends using the Oracle JRE/JDK rather than OpenJDK: "OpenJDK shows intermittent performance and UI issues. We recommend using the Oracle JRE/JDK."). Android Studio requires that your JAVA_HOME environment variable be set correctly.
    - Note: Ubuntu users may need to might need to change the default version manually (http://askubuntu.com/questions/272187/setting-jdk-7-as-default)
    - Note: If you're running on a pure 64 bit system, you'll need to install lib32-glibc (at least, that's what it's called on Arch) to run the android aapt utility as part of building. I also had to install the following Arch packages for 32-bit support: lib32-zlib, lib32-libstdc++5.
3. Download and install the Android NDK (https://developer.android.com/tools/sdk/ndk/index.html).
    - Note: "Installing" the NDK means adding a ndk.dir entry to your fskube/android/local.properties file.
4. Download additional packages from the Android SDK Manager, which you can access either through Android Studio or the command line (http://developer.android.com/sdk/installing/adding-packages.html). You need Android SDK Tools, Android SDK Platform-tools, Android SDK Build-tools, SDK Platform (I'm using 19 because I can't figure out compatibility issues with 20. Punted to another day), a system image for the emulator if you're going to use it, and maybe also the Android Support Repository and Android Support Library.
    - JF: It looks like the sdk that came with android-studio came with Android SDK Tools, Android SDK Platform-tools, Android SDK Build-tools. I didn't need to install SDK Platform or any 19 things in order to compile.
5. Open Android Studio (https://developer.android.com/sdk/installing/index.html?pkg=studio) and import existing project. Be sure to choose the root android directory (fskube/android), which is the project directory, instead of one of the subdirectories, which are modules.
    - JF: I had to specifically choose fskube/android/build.gradle. I also chose to open the existing project, rather than import it.
6. You might need to inform gradle of where your SDK and NDK live. For SDK, I set ANDROID_HOME environment variable in my .bashrc; it looks like /path/to/whereIinstalledAndroidStudio/android-studio/sdk. For NDK, I created local.properties in root directory with the following line: ndk.dir=/path/to/whereIinstalledNDK/android-ndk-r10. It seems like after the first time you build the project with gradle (see step 7), local.properties gets overwritten with the correct directories and your ANDROID_HOME variable might become irrelevant. Weird.
    - JF: I did not need to set my ANDROID_HOME environment for gradle to work. I did have to set ndk.dir in local.properties (sdk.dir appeared to have already been set, presumably because android-studio came bundled with the sdk).
7. Build the project from the command line (http://developer.android.com/sdk/installing/studio-build.html#buildCmd).

## Creating com_jflei_fskube_FSKubeWrapper.h
- http://ph0b.com/android-studio-gradle-and-ndk-integration/
   - First force a build (ctrl-f9)
   - ~/AndroidStudioProjects/Fskube/app/src/main @localhost> /usr/java/default/bin/javah -d jni -classpath /home/jeremy/thirdrepos/adt-bundle-linux-x86_64-20131030/sdk/platforms/android-19/android.jar:../../build/intermediates/classes/debug com.jflei.fskube.FSKubeWrapper

- http://blog.blundell-apps.com/locally-release-an-android-library-for-jcenter-or-maven-central-inclusion/
   - https://raw.githubusercontent.com/blundell/release-android-library/master/android-release-aar.gradle

## Releasing
    - Bump version number in  `fskube-android/build.gradle`.
    - `./gradlew uploadArchives`
    - Go to https://bintray.com/jfly/maven/fskube/ to publish unpublished artifacts

