import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  keywords?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'article',
  siteName = 'RentPal - P2P Rental Marketplace India',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  keywords,
  canonicalUrl,
  noindex = false,
  nofollow = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | ${siteName}`;
    }

    // Helper function to update or create meta tag
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper function to update or create link tag
    const updateLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Basic meta tags
    if (description) {
      updateMetaTag('description', description);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    if (author) {
      updateMetaTag('author', author);
    }

    // Open Graph tags
    if (title) {
      updateMetaTag('og:title', title, true);
    }
    if (description) {
      updateMetaTag('og:description', description, true);
    }
    if (image) {
      updateMetaTag('og:image', image, true);
    }
    if (url) {
      updateMetaTag('og:url', url, true);
    }
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', siteName, true);
    if (author) {
      updateMetaTag('article:author', author, true);
    }
    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }
    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, true);
    }
    if (section) {
      updateMetaTag('article:section', section, true);
    }
    // Remove existing article:tag meta tags
    document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
    // Add new article:tag meta tags for each tag
    tags.forEach((tag) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'article:tag');
      meta.setAttribute('content', tag);
      document.head.appendChild(meta);
    });

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    if (title) {
      updateMetaTag('twitter:title', title);
    }
    if (description) {
      updateMetaTag('twitter:description', description);
    }
    if (image) {
      updateMetaTag('twitter:image', image);
    }

    // Canonical URL
    if (canonicalUrl) {
      updateLinkTag('canonical', canonicalUrl);
    }

    // Robots meta
    const robotsContent = [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow',
    ].join(', ');
    updateMetaTag('robots', robotsContent);

    // JSON-LD structured data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'BlogPosting' : 'WebPage',
      ...(title && { headline: title }),
      ...(description && { description }),
      ...(image && { image: image }),
      ...(url && { url }),
      ...(author && {
        author: {
          '@type': 'Person',
          name: author,
        },
      }),
      ...(publishedTime && { datePublished: publishedTime }),
      ...(modifiedTime && { dateModified: modifiedTime }),
      ...(section && { articleSection: section }),
      ...(tags.length > 0 && { keywords: tags.join(', ') }),
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: image || 'https://res.cloudinary.com/dmq75b48d/image/upload/v1762800581/logo-remove_elajrc.png',
        },
      },
    };

    // Remove existing structured data script
    const existingScript = document.querySelector('script[type="application/ld+json"][data-seo]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Optionally clean up on unmount, but usually we want to keep meta tags
      // You can uncomment if needed:
      // const seoScript = document.querySelector('script[type="application/ld+json"][data-seo]');
      // if (seoScript) seoScript.remove();
    };
  }, [
    title,
    description,
    image,
    url,
    type,
    siteName,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    keywords,
    canonicalUrl,
    noindex,
    nofollow,
  ]);

  return null; // This component doesn't render anything
};

