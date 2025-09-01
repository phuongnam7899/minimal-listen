import packageJson from '../../package.json';

export const environment = {
  production: true,
  version: packageJson.version,
  appTitle: "Nam's Music",
  audioBasePath: 'assets/music/nam',
  songs: [
    { id: 1, title: 'anh den pho', filename: 'anh_den_pho.mp3' },
    // Add Nam's songs here
  ],
};
