import ClockWidgetView from './Clock/ClockWidgetView';
import ClockWidgetConfig from './Clock/ClockWidgetConfig';

import QuoteWidgetView from './Quote/QuoteWidgetView';
import QuoteWidgetConfig from './Quote/QuoteWidgetConfig';

import WeatherWidgetView from './Weather/WeatherWidgetView';
import WeatherWidgetConfig from './Weather/WeatherWidgetConfig';

export const widgetRegistry = {
  clock: {
    name: 'Digital Clock',
    description: 'Displays a live clock customizable with local timezone, styling, and 24h formats.',
    icon: 'Clock',
    view: ClockWidgetView,
    config: ClockWidgetConfig,
    defaultConfig: {
      timeFormat: '12',
      showSeconds: true,
      textColor: '#ffffff',
      fontSize: '36px',
      fontFamily: 'Outfit',
      backgroundColor: 'transparent',
      backgroundImageUrl: '',
      borderColor: 'transparent',
      borderWidth: '0px'
    }
  },
  quote: {
    name: 'Inspiring Quotes',
    description: 'Displays a rotating selection of daily wisdom and design quotes with card styles.',
    icon: 'MessageSquareQuote',
    view: QuoteWidgetView,
    config: QuoteWidgetConfig,
    defaultConfig: {
      category: 'motivational',
      textAlign: 'center',
      textColor: '#ffffff',
      fontSize: '18px',
      backgroundStyle: 'gradient', // 'solid' or 'gradient'
      backgroundColor: '#1b2542',
      gradientName: 'royal',
      backgroundImageUrl: '',
      borderRadius: '12px',
      showAuthor: true
    }
  },
  weather: {
    name: 'Weather Forecast',
    description: 'Real-time temperature and status check for cities, powered by a backend proxy.',
    icon: 'CloudSun',
    view: WeatherWidgetView,
    config: WeatherWidgetConfig,
    defaultConfig: {
      city: 'Paris',
      unit: 'C',
      textColor: '#ffffff',
      backgroundColor: '#131a30',
      backgroundStyle: 'gradient',
      gradientName: 'sunset',
      backgroundImageUrl: '',
      borderRadius: '12px'
    }
  }
};

export const GRADIENTS = {
  // Blues & Royals
  royal:     'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  ocean:     'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  arctic:    'linear-gradient(135deg, #2980b9 0%, #6dd5fa 50%, #ffffff 100%)',
  midnight:  'linear-gradient(135deg, #0d0d2b 0%, #1a1a5e 50%, #3d348b 100%)',

  // Purples & Cosmics
  cosmic:    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  nebula:    'linear-gradient(135deg, #3d0366 0%, #c6007e 100%)',
  aurora:    'linear-gradient(135deg, #007991 0%, #78ffd6 100%)',
  lavender:  'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',

  // Sunsets & Warms
  sunset:    'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
  ember:     'linear-gradient(135deg, #c31432 0%, #240b36 100%)',
  peach:     'linear-gradient(135deg, #ed4264 0%, #ffedbc 100%)',
  gold:      'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',

  // Greens & Nature
  forest:    'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  emerald:   'linear-gradient(135deg, #0f9b58 0%, #00bf8f 100%)',
  lime:      'linear-gradient(135deg, #acb6e5 0%, #86fde8 100%)',

  // Neons & Synthwave
  neon:      'linear-gradient(135deg, #0575e6 0%, #00f260 100%)',
  synthwave: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
  cyberpunk: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',

  // Neutrals & Darks
  darkness:  'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
  obsidian:  'linear-gradient(135deg, #1c1c1c 0%, #3d3d3d 100%)',
};
