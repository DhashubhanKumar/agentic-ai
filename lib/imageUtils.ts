// Helper function to generate placeholder watch images
export function getWatchPlaceholder(watchName: string, brandName: string): string {
    // Create a deterministic color based on brand name
    const brandColors: Record<string, string> = {
        'Casio': '1a1a1a/ffd700',
        'Timex': '2c3e50/3498db',
        'Fossil': '8b4513/daa520',
        'Rolex': '0a3d0a/ffd700',
        'Patek Philippe': '1a1a2e/c0c0c0',
    };

    const colorScheme = brandColors[brandName] || '1a1a1a/ffffff';

    // Create placeholder with brand and watch name
    return `https://placehold.co/600x600/${colorScheme}?text=${encodeURIComponent(brandName + '\\n' + watchName)}`;
}

// Helper to get first image or placeholder
export function getFirstImage(images: any, watchName: string = 'Watch', brandName: string = 'Brand'): string {
    if (Array.isArray(images) && images.length > 0) {
        return images[0];
    }
    if (typeof images === 'string') {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
        } catch {
            return getWatchPlaceholder(watchName, brandName);
        }
    }
    return getWatchPlaceholder(watchName, brandName);
}
