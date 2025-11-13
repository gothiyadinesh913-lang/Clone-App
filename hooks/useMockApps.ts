
import { AppInfo } from '../types';
import { MessageSquare, Camera, Youtube, Twitter, Shield, Banknote, Gamepad2, Briefcase } from 'lucide-react';

const mockApps: AppInfo[] = [
  { name: 'SocialApp', packageName: 'com.social.app', icon: MessageSquare, size: '128 MB' },
  { name: 'PhotoSnap', packageName: 'com.camera.photosnap', icon: Camera, size: '256 MB' },
  { name: 'StreamTube', packageName: 'com.video.streamtube', icon: Youtube, size: '150 MB' },
  { name: 'Chirper', packageName: 'com.microblog.chirper', icon: Twitter, size: '98 MB' },
  { name: 'PixelQuest', packageName: 'com.game.pixelquest', icon: Gamepad2, size: '512 MB' },
  { name: 'SecureBank', packageName: 'com.finance.securebank', icon: Banknote, size: '110 MB', isBankingApp: true },
  { name: 'SafeAuth', packageName: 'com.security.safeauth', icon: Shield, size: '50 MB', isBankingApp: true },
];

export const useMockApps = (): AppInfo[] => {
  return mockApps;
};