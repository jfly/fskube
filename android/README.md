- http://ph0b.com/android-studio-gradle-and-ndk-integration/
   - First force a build (ctrl-f9)
   - ~/AndroidStudioProjects/Fskube/app/src/main @localhost> /usr/java/default/bin/javah -d jni -classpath /home/jeremy/thirdrepos/adt-bundle-linux-x86_64-20131030/sdk/platforms/android-19/android.jar:../../build/intermediates/classes/debug com.jflei.fskube.FSKubeWrapper

- http://blog.blundell-apps.com/locally-release-an-android-library-for-jcenter-or-maven-central-inclusion/
   - https://raw.githubusercontent.com/blundell/release-android-library/master/android-release-aar.gradle

## Releasing
- `./gradlew uploadArchives`
   - Go to https://bintray.com/jfly/maven/fskube/ to publish unpublished artifacts

## Get yourself set up
1. Download and install Android Studio (https://developer.android.com/sdk/installing/studio.html).
2. You need JDK 6 or greater (https://developer.android.com/sdk/installing/index.html?pkg=studio). I'm using 7. After you've installed it, you might need to change the default version manually (http://askubuntu.com/questions/272187/setting-jdk-7-as-default). I also set JAVA_HOME environment variable in my .bashrc for good measure. Not sure which one you need to do, or both.
3. Download and install the Android NDK (https://developer.android.com/tools/sdk/ndk/index.html).
4. Download additional packages from the Android SDK Manager, which you can access either through Android Studio or the command line (http://developer.android.com/sdk/installing/adding-packages.html). You need Android SDK Tools, Android SDK Platform-tools, Android SDK Build-tools, SDK Platform (I used L-preview, which is 20), a system image for the emulator if you're going to use it, and maybe also the Android Support Repository and Android Support Library.
5. Open Android Studio (https://developer.android.com/sdk/installing/index.html?pkg=studio) and import existing project. Be sure to choose the root android directory (fskube/android), which is the project directory, instead of one of the subdirectories, which are modules.
6. You might need to inform gradle of where your SDK and NDK live. For SDK, I set ANDROID_HOME environment variable in my .bashrc; it looks like /path/to/whereIinstalledAndroidStudio/android-studio/sdk. For NDK, I created local.properties in root directory with the following line: ndk.dir=/path/to/whereIinstalledNDK/android-ndk-r10. It seems like after the first time you build the project with gradle (see step 7), local.properties gets overwritten with the correct directories and your ANDROID_HOME variable might become irrelevant. Weird.
7. Build the project from the command line (http://developer.android.com/sdk/installing/studio-build.html#buildCmd).