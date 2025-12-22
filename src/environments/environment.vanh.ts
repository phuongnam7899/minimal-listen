import packageJson from '../../package.json';

export const environment = {
  production: true,
  version: packageJson.version,
  appTitle: "Vanh's Music",
  audioBasePath: 'assets/music/vanh',
  songs: [
    { id: 1, title: 'Rain', filename: 'rain.mp3' },
    // Add Vanh's songs here
  ],
};
