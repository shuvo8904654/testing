import { useEffect } from 'react';

interface MetaTagsConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
}

export function useDynamicMeta(config: MetaTagsConfig) {
  useEffect(() => {
    // Store original meta tags to restore later
    const originalTags: Record<string, string> = {};
    
    // Function to update or create meta tag
    const updateMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      
      if (!metaTag) {
        // Check for name attribute as well (for Twitter cards)
        metaTag = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
      }
      
      if (metaTag) {
        // Store original content
        if (!originalTags[property]) {
          originalTags[property] = metaTag.content;
        }
        metaTag.content = content;
      } else {
        // Create new meta tag
        metaTag = document.createElement('meta');
        if (property.startsWith('twitter:')) {
          metaTag.name = property;
        } else {
          metaTag.setAttribute('property', property);
        }
        metaTag.content = content;
        document.head.appendChild(metaTag);
      }
    };

    // Update document title
    if (config.title) {
      const originalTitle = document.title;
      document.title = `${config.title} | 3ZERO Club Kurigram`;
      
      // Store for cleanup
      originalTags['title'] = originalTitle;
    }

    // Update Open Graph tags
    if (config.title) {
      updateMetaTag('og:title', config.title);
    }
    
    if (config.description) {
      updateMetaTag('og:description', config.description);
      updateMetaTag('description', config.description);
    }
    
    if (config.image) {
      updateMetaTag('og:image', config.image);
      updateMetaTag('og:image:alt', config.title || 'Article image');
    }
    
    if (config.url) {
      updateMetaTag('og:url', config.url);
    }
    
    if (config.type) {
      updateMetaTag('og:type', config.type);
    }
    
    if (config.siteName) {
      updateMetaTag('og:site_name', config.siteName);
    }
    
    if (config.author) {
      updateMetaTag('article:author', config.author);
    }
    
    if (config.publishedTime) {
      updateMetaTag('article:published_time', config.publishedTime);
    }

    // Update Twitter Card tags
    if (config.title) {
      updateMetaTag('twitter:title', config.title);
    }
    
    if (config.description) {
      updateMetaTag('twitter:description', config.description);
    }
    
    if (config.image) {
      updateMetaTag('twitter:image', config.image);
      updateMetaTag('twitter:image:alt', config.title || 'Article image');
    }

    // Cleanup function to restore original tags
    return () => {
      // Restore document title
      if (originalTags['title']) {
        document.title = originalTags['title'];
      }
      
      // Restore other meta tags
      Object.entries(originalTags).forEach(([property, content]) => {
        if (property === 'title') return; // Already handled above
        
        let metaTag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!metaTag) {
          metaTag = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
        }
        
        if (metaTag) {
          metaTag.content = content;
        }
      });
    };
  }, [config.title, config.description, config.image, config.url, config.type, config.siteName, config.author, config.publishedTime]);
}