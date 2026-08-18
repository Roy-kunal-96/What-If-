import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  PieChart,
  PauseCircle,
  Home,
  Car,
  Briefcase,
  AlertTriangle,
  Compass,
  Sun,
  Baby,
  Heart,
  Users,
  MapPin,
  Gift,
  Target,
  Sparkles,
  HeartPulse,
  DollarSign,
  Shield,
  Zap,
  Activity,
  Award,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Calendar,
  Eye,
  Info,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';

interface IconHelperProps {
  name: string;
  className?: string;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'TrendingDown': return <TrendingDown className={className} />;
    case 'Coins': return <Coins className={className} />;
    case 'PieChart': return <PieChart className={className} />;
    case 'PauseCircle': return <PauseCircle className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Car': return <Car className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'AlertTriangle': return <AlertTriangle className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Sun': return <Sun className={className} />;
    case 'Baby': return <Baby className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Users': return <Users className={className} />;
    case 'MapPin': return <MapPin className={className} />;
    case 'Gift': return <Gift className={className} />;
    case 'Target': return <Target className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'DollarSign': return <DollarSign className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'ArrowRight': return <ArrowRight className={className} />;
    case 'Plus': return <Plus className={className} />;
    case 'RefreshCw': return <RefreshCw className={className} />;
    case 'Sliders': return <Sliders className={className} />;
    case 'CheckCircle2': return <CheckCircle2 className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'Info': return <Info className={className} />;
    case 'HelpCircle': return <HelpCircle className={className} />;
    default: return <FolderOpen className={className} />;
  }
};
