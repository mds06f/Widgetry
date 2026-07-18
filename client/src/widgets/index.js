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
      borderWidth: '0px',
      customCSS: ''
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
      showAuthor: true,
      customCSS: ''
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
      borderRadius: '12px',
      customCSS: ''
    }
  }
};

export const GRADIENTS = {
  royal: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  sunset: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
  ocean: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  neon: 'linear-gradient(135deg, #0575e6 0%, #00f260 100%)',
  cosmic: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  darkness: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)'
};
