import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Images } from "lucide-react";
import type { GalleryImage } from "@shared/schema";

export default function Gallery() {
  const { data: galleryData, isLoading } = useQuery<{images: GalleryImage[], analytics: any}>({
    queryKey: ["/api/gallery"],
  });

  const images = galleryData?.images || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50" data-testid="gallery-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">Gallery</h1>
          <p className="text-xl text-gray-600">
            Capturing moments of change and community action
          </p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {images.map((image, index) => (
              <div 
                key={image._id || image.id} 
                className="bg-white rounded-xl overflow-hidden shadow-lg hover-scale"
                data-testid={`gallery-image-${index}`}
              >
                <img 
                  src={image.imageUrl || image.url} 
                  alt={image.title}
                  className="w-full h-48 object-cover"
                  data-testid={`image-${index}`}
                />
                <div className="p-3">
                  <h3 className="font-medium text-gray-900">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-gray-600 mt-1" data-testid={`image-description-${index}`}>
                      {image.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Images className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Yet</h3>
            <p className="text-gray-500 mb-4">Gallery images will appear here once they are uploaded and approved.</p>
          </div>
        )}

        <div className="text-center">
          <Button className="bg-youth-blue text-white px-8 py-3 hover:bg-youth-blue-dark" data-testid="button-view-all">
            <Images className="mr-2" />
            View All Photos
          </Button>
        </div>
      </div>
    </div>
  );
}
