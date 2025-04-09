import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: "Cultural Exchange",
      description: "Explore diverse traditions and customs from around the world.",
      color: "from-brasil-green to-brasil-blue"
    },
    {
      title: "Language Learning", 
      description: "Discover new ways to communicate across different cultures.",
      color: "from-brasil-yellow to-portugal-red"
    },
    {
      title: "Global Community",
      description: "Connect with people from diverse backgrounds and regions.",
      color: "from-brasil-blue to-portugal-green"
    },
    {
      title: "Inclusive Design",
      description: "Experience a platform built for everyone, regardless of origin.",
      color: "from-portugal-red to-brasil-yellow"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-brasil-green to-brasil-blue bg-clip-text text-transparent">
          Discover the World Together
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className={`bg-gradient-to-br ${feature.color} rounded-t-lg`}>
                <div className="h-8"></div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardTitle className="mb-2 text-xl">{feature.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
