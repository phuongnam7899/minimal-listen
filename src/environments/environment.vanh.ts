import packageJson from '../../package.json';

export const environment = {
  production: true,
  version: packageJson.version,
  appTitle: "Vanh's Music",
  audioBasePath: 'assets/music/vanh',
  songs: [
    { id: 1, title: 'Rain', filename: 'rain2.opus' },
    { id: 2, title: 'Rain 2', filename: 'rain2.opus' },
    { id: 3, title: 'Rain 3', filename: 'rain2.opus' },
    { id: 4, title: 'Rain 4', filename: 'rain2.opus' },
    // Add Vanh's songs here
  ],
};
