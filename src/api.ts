import { Channel, Category } from './types';

const API_BASE = '/api/iptv';
const CACHE_KEY = 'streamx_cache_data_v23';
const CACHE_TIME_KEY = 'streamx_cache_time';
const CACHE_TTL = 1000 * 60 * 60 * 48; 

function normalize(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cleanChannelTitle(str: string): string {
  if (!str) return '';
  return str
    .replace(/^\[?[a-z]{2,3}\]?[:\s|-]+/i, '')
    .replace(/\(.*?\)|\[.*?\]/g, '')
    .replace(/\b(hd|fhd|sd|1080p|720p|4k|tv|live|channel|stream|feed)\b/gi, '')
    .trim();
}

function ensureHttps(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://')) {
    return 'https://' + url.slice(7);
  }
  return url;
}

export function getCachedChannels(): { categories: Category[], channels: Channel[], countries: any[], languages: any[] } | null {
  if (typeof window === 'undefined') return null;
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (!cachedData) return null;
  try {
    return JSON.parse(cachedData);
  } catch (e) {
    console.warn('Failed to parse cached data', e);
    return null;
  }
}

export async function fetchChannels(): Promise<{ categories: Category[], channels: Channel[], countries: any[], languages: any[] }> {
  try {
    if (typeof window !== 'undefined') {
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const cachedData = getCachedChannels();
      
      if (cachedData && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_TTL) {
        return cachedData;
      }
    }

    const [channelsRes, streamsRes, logosRes, categoriesRes, liveTvRes] = await Promise.all([
      fetch(`${API_BASE}?action=channels`).catch(() => null),
      fetch(`${API_BASE}?action=streams`).catch(() => null),
      fetch(`${API_BASE}?action=logos`).catch(() => null),
      fetch(`${API_BASE}?action=categories`).catch(() => null),
      fetch('/api/live-tv').catch(() => fetch('https://omegatech-api.dixonomega.tech/api/movie/Live-Tv?action=list')).catch(() => null),
    ]);

    const channelsData = channelsRes ? await channelsRes.json().catch(() => ({ success: false })) : { success: false };
    const streamsData = streamsRes ? await streamsRes.json().catch(() => ({ success: false })) : { success: false };
    const logosData = logosRes ? await logosRes.json().catch(() => ({ success: false })) : { success: false };
    const categoriesData = categoriesRes ? await categoriesRes.json().catch(() => ({ success: false })) : { success: false };
    const liveTvData = liveTvRes ? await liveTvRes.json().catch(() => null) : null;

    if (channelsData.success && streamsData.success) {
      const channelMetaMap = new Map<string, any>();
      const channelNameMap = new Map<string, any>();

      channelsData.data.forEach((c: any) => {
        if (c.id) channelMetaMap.set(c.id.toLowerCase(), c);
        if (c.name) {
          channelNameMap.set(normalize(c.name), c);
          channelNameMap.set(normalize(cleanChannelTitle(c.name)), c);
        }
        if (c.alt_names && Array.isArray(c.alt_names)) {
          c.alt_names.forEach((alt: string) => {
            if (alt) {
              channelNameMap.set(normalize(alt), c);
              channelNameMap.set(normalize(cleanChannelTitle(alt)), c);
            }
          });
        }
      });

      const channelLogoMap = new Map<string, string>();
      const logoByNameMap = new Map<string, string>();

      if (logosData.success && Array.isArray(logosData.data)) {
        logosData.data.forEach((l: any) => {
          if (l.url) {
            const httpsUrl = ensureHttps(l.url);
            if (l.channel) {
              const lowerChan = l.channel.toLowerCase();
              if (!channelLogoMap.has(lowerChan)) {
                channelLogoMap.set(lowerChan, httpsUrl);
              }
              const normChan = normalize(l.channel);
              if (!logoByNameMap.has(normChan)) {
                logoByNameMap.set(normChan, httpsUrl);
              }

              const meta = channelMetaMap.get(lowerChan);
              if (meta) {
                if (meta.name) {
                  logoByNameMap.set(normalize(meta.name), httpsUrl);
                  logoByNameMap.set(normalize(cleanChannelTitle(meta.name)), httpsUrl);
                }
                if (meta.alt_names && Array.isArray(meta.alt_names)) {
                  meta.alt_names.forEach((alt: string) => {
                    if (alt) {
                      logoByNameMap.set(normalize(alt), httpsUrl);
                      logoByNameMap.set(normalize(cleanChannelTitle(alt)), httpsUrl);
                    }
                  });
                }
              }
            }
          }
        });
      }

      const officialCategoriesMap = new Map<string, string>();
      if (categoriesData.success && Array.isArray(categoriesData.data)) {
        categoriesData.data.forEach((cat: any) => {
          officialCategoriesMap.set(cat.id, cat.name);
        });
      }

      const processedChannels: Channel[] = [];
      const usedCategoriesSet = new Set<string>();

      const activeStreams = streamsData.data
        .filter((s: any) => s.url && (s.url.startsWith('https://') || s.url.startsWith('http://')));

      activeStreams.forEach((stream: any, index: number) => {
        const streamTitle = stream.title || stream.channel || 'Unknown Channel';
        const cleanedTitle = cleanChannelTitle(streamTitle);

        let meta = stream.channel ? channelMetaMap.get(stream.channel.toLowerCase()) : null;
        if (!meta) {
          meta = channelNameMap.get(normalize(streamTitle));
        }
        if (!meta) {
          meta = channelNameMap.get(normalize(cleanedTitle));
        }

        const name = meta?.name || streamTitle;

        let categoryId = 'general';
        if (meta && meta.categories && meta.categories.length > 0) {
          categoryId = meta.categories[0];
        } else {
          const lowerTitle = streamTitle.toLowerCase();
          if (lowerTitle.includes('news')) categoryId = 'news';
          else if (lowerTitle.includes('sport')) categoryId = 'sports';
          else if (lowerTitle.includes('music')) categoryId = 'music';
          else if (lowerTitle.includes('movie') || lowerTitle.includes('film')) categoryId = 'movies';
          else if (lowerTitle.includes('kid') || lowerTitle.includes('cartoon') || lowerTitle.includes('disney')) categoryId = 'kids';
          else if (lowerTitle.includes('comedy')) categoryId = 'comedy';
          else if (lowerTitle.includes('auto') || lowerTitle.includes('car')) categoryId = 'auto';
          else if (lowerTitle.includes('business')) categoryId = 'business';
          else if (lowerTitle.includes('doc')) categoryId = 'documentary';
        }

        let logo = '';

        if (stream.logo) logo = ensureHttps(stream.logo);
        if (!logo && stream.icon) logo = ensureHttps(stream.icon);
        if (!logo && stream.tvg_logo) logo = ensureHttps(stream.tvg_logo);
        if (!logo && stream.image) logo = ensureHttps(stream.image);
        if (!logo && stream.logo_url) logo = ensureHttps(stream.logo_url);

        if (!logo && meta) {
          if (meta.logo) logo = ensureHttps(meta.logo);
          if (!logo && meta.icon) logo = ensureHttps(meta.icon);
        }

        if (!logo && stream.channel) {
          logo = channelLogoMap.get(stream.channel.toLowerCase()) || '';
        }
        if (!logo && meta?.id) {
          logo = channelLogoMap.get(meta.id.toLowerCase()) || '';
        }
        if (!logo) {
          logo = logoByNameMap.get(normalize(streamTitle)) || '';
        }
        if (!logo) {
          logo = logoByNameMap.get(normalize(cleanedTitle)) || '';
        }
        if (!logo && meta?.name) {
          logo = logoByNameMap.get(normalize(meta.name)) || '';
        }

        if (!logo && meta?.id) {
          logo = `https://raw.githubusercontent.com/iptv-org/iptv/master/logos/${meta.id}.png`;
        }

        if (!logo && meta?.website) {
          try {
            const host = new URL(meta.website).hostname;
            if (host) {
              logo = `https://www.google.com/s2/favicons?domain=${host}&sz=256`;
            }
          } catch (e) {
          }
        }

        usedCategoriesSet.add(categoryId);

        const streamUrl = `/api/stream-proxy?url=${encodeURIComponent(stream.url)}`;
        const nowPlayingInfo = stream.title_now || stream.epg_now || stream.current_program || stream.now_playing || 
                               (stream.quality ? `Quality: ${stream.quality}` : undefined);

        const country = meta?.countries?.[0] || stream.country || stream.region;
        const language = meta?.languages?.[0] || stream.language;

        processedChannels.push({
          id: `${stream.channel || 'stream'}-${index}`,
          name,
          logo,
          url: streamUrl,
          category: categoryId,
          country,
          language,
          nowPlaying: nowPlayingInfo,
        });
      });

      if (liveTvData && (liveTvData.success || liveTvData.statusCode === 200) && liveTvData.data) {
        const entries = Object.entries(liveTvData.data);
        entries.forEach(([key, item]: [string, any]) => {
          if (!item || !item.url) return;

          const streamTitle = item.name || key;
          const cleanedTitle = cleanChannelTitle(streamTitle);

          let categoryId = 'general';
          if (item.category) {
            const catLower = item.category.toLowerCase().trim();
            if (catLower.includes('news')) categoryId = 'news';
            else if (catLower.includes('sport')) categoryId = 'sports';
            else if (catLower.includes('movie') || catLower.includes('film')) categoryId = 'movies';
            else if (catLower.includes('kid') || catLower.includes('cartoon') || catLower.includes('child')) categoryId = 'kids';
            else if (catLower.includes('music')) categoryId = 'music';
            else if (catLower.includes('culture') || catLower.includes('art')) categoryId = 'culture';
            else if (catLower.includes('regional')) categoryId = 'regional';
            else if (catLower.includes('doc')) categoryId = 'documentary';
            else if (catLower.includes('ent') || catLower.includes('drama')) categoryId = 'entertainment';
            else categoryId = catLower.replace(/[^a-z0-9]/g, '') || 'general';
          }

          let logo = logoByNameMap.get(normalize(streamTitle)) || logoByNameMap.get(normalize(cleanedTitle)) || '';
          if (!logo) {
            const meta = channelNameMap.get(normalize(streamTitle)) || channelNameMap.get(normalize(cleanedTitle));
            if (meta?.id) {
              logo = `https://raw.githubusercontent.com/iptv-org/iptv/master/logos/${meta.id}.png`;
            }
          }

          usedCategoriesSet.add(categoryId);

          const streamUrl = item.url;
          const nowPlayingInfo = item.title || item.epg_now || item.current_program || item.now_playing || 
                                'Omegatech Gold Stream';

          processedChannels.push({
            id: `gold-${key}`,
            name: item.name || key,
            logo,
            url: streamUrl,
            category: categoryId,
            country: item.region || item.country,
            language: item.language,
            nowPlaying: nowPlayingInfo,
            isGold: true,
          });
        });
      }

      const categories: Category[] = [
        { id: 'all', name: 'All Channels' }
      ];

      usedCategoriesSet.forEach(catId => {
        const officialName = officialCategoriesMap.get(catId);
        const name = officialName || (catId.charAt(0).toUpperCase() + catId.slice(1));
        categories.push({ id: catId, name });
      });

      const countries: { id: string, name: string, count: number }[] = [];
      const languages: { id: string, name: string, count: number }[] = [];

      const countryCounts = new Map<string, number>();
      const languageCounts = new Map<string, number>();

      processedChannels.forEach(c => {
        if (c.country) {
          countryCounts.set(c.country, (countryCounts.get(c.country) || 0) + 1);
        }
        if (c.language) {
          languageCounts.set(c.language, (languageCounts.get(c.language) || 0) + 1);
        }
      });

      Array.from(countryCounts.entries()).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
        countries.push({ id: `country-${normalize(name)}`, name, count });
      });

      Array.from(languageCounts.entries()).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
        languages.push({ id: `lang-${normalize(name)}`, name, count });
      });

      const result = { categories, channels: processedChannels, countries, languages };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(result));
          localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        } catch (e) {
          console.warn('Failed to save to localStorage', e);
        }
      }

      return result;
    }
  } catch (error) {
    console.error('API Fetch failed. Using fallback cache if available.', error);
    const fallback = getCachedChannels();
    if (fallback) return fallback;
  }
  
  return { categories: [{ id: 'all', name: 'All Channels' }], channels: [], countries: [], languages: [] };
}
