- http://ph0b.com/android-studio-gradle-and-ndk-integration/
   - First force a build (ctrl-f9)
   - ~/AndroidStudioProjects/Fskube/app/src/main @localhost> /usr/java/default/bin/javah -d jni -classpath /home/jeremy/thirdrepos/adt-bundle-linux-x86_64-20131030/sdk/platforms/android-19/android.jar:../../../app/build/intermediates/classes/debug com.jflei.fskube.FSKubeWrapper

- http://blog.blundell-apps.com/locally-release-an-android-library-for-jcenter-or-maven-central-inclusion/
   - https://raw.githubusercontent.com/blundell/release-android-library/master/android-release-aar.gradle

## Releasing
- `./gradlew uploadArchives`
   - Go to https://bintray.com/jfly/maven/fskube/ to publish unpublished artifacts
