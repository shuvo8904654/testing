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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {images?.map((image, index) => (
            <div 
              key={image.id} 
              className="bg-white rounded-xl overflow-hidden shadow-lg hover-scale"
              data-testid={`gallery-image-${index}`}
            >
              <img 
                src={image.imageUrl || image.url} 
                alt={image.title}
                className="w-full h-48 object-cover"
                data-testid={`image-${index}`}
              />
              {image.description && (
                <div className="p-3" data-testid={`image-description-${index}`}>
                  <p className="text-sm text-gray-600">{image.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

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
