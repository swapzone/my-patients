

// process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preference' : '/var/local')

/*
 The expected result is:

 OS X - '/Users/user/Library/Preferences'
 Windows 8 - 'C:\Users\User\AppData\Roaming'
 Windows XP - 'C:\Documents and Settings\User\Application Data'
 Linux - '/var/local'
 */