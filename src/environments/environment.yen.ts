import packageJson from '../../package.json';

export const environment = {
  production: true,
  version: packageJson.version,
  appTitle: "Yen's Music",
  audioBasePath: 'assets/music/yen',
  songs: [
    { id: 1, title: 'Anh Den Pho', filename: 'anh_den_pho.mp3' },
    // Add more Yen's songs here
  ],
};
