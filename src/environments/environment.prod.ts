import packageJson from '../../package.json';

export const environment = {
  production: true,
  version: packageJson.version,
  appTitle: 'Music',
  audioBasePath: 'assets/music/default',
  songs: [{ id: 1, title: 'Anh Den Pho', filename: 'anh_den_pho.mp3' }],
};
