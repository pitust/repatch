# RePatch - The easiest reBrawl modding solution
## Getting started
You will need:
 - [VirtualXposed](https://github.com/android-hacker/VirtualXposed)
 - [WiFi FTP Server](https://play.google.com/store/apps/details?id=com.medhaapps.wififtpserver) (in virtualXposed)
 - [ReBrawl](https://rebrawl.gg/) (also in virtualXposed)
Then, go to the releases page and download the installer for the correct system.
### Installing dependencies
You first need to have [node.js](https://nodejs.org/en/download/) installed on your computer.
After you install node.js, download or clone this project, and then use the **cmd** to get to the root folder of the project
```cd (project root)```
Then, type 
```
npm install electron
```
This will install Electron. 
**Make sure you have ran reBrawl once before getting to the next part**
#### Using the Application
Assuming you've followed the steps on **Installing dependencies**, type
```
cd node_modules\electron\dist
```
in cmd.

After you do this step, do **not** close the command line. I'm assuming you installed the programs stated on the Getting Started part.
On your phone, open WiFi FTP Server from virtualxposed, and click the **Start** button. This will start the FTP server. 

Switch back to your computer. Start the application by typing ```electron.exe (project root)```
After you've done it, a popup will show up. Type your IP showed in Wifi FTP Server **without the port**. 

Then click **Add a map** and select where you will get the file from. The file should include the map in a text file with formatting from brawl stars files(for example with "MM..WW.FF..RRR...")
After you select it, fill in the blanks and click **Add to queue!**.

Click on the **Actions** tab and click **download**, and then **push**. Restart reBrawl and enter the game. Your map will show up in friendly game map selection menu.

### Installing the snap
If you decide to use snapcraft to install
