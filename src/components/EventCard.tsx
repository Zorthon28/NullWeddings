"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, MapPin, Car, ParkingCircle } from "lucide-react";

interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  address: string;
  description: string;
  mapsUrl: string;
  transportation: string[];
  parking: string;
}

export default function EventCard({
  title,
  date,
  time,
  location,
  address,
  description,
  mapsUrl,
  transportation,
  parking,
}: EventCardProps) {
  const openMaps = () => {
    window.open(mapsUrl, "_blank");
  };

  return (
    <Card className="bg-white border-2 border-gray-200 hover:border-gold transition-all duration-300 ease-in-out hover:shadow-2xl shadow-lg">
      <CardHeader className="text-center border-b border-gray-100 pb-6 p-6 md:p-8">
        <div className="flex items-center justify-center mb-4">
          <div className="h-px w-12 bg-gold"></div>
          <div className="mx-3 w-2 h-2 bg-gold rotate-45"></div>
          <div className="h-px w-12 bg-gold"></div>
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {title}
        </CardTitle>
        <CardDescription className="text-sm md:text-base text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm md:text-base">
              {date}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm md:text-base">
              {time}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm md:text-base">
              {location}
            </p>
            <p className="text-xs md:text-sm text-gray-600 mt-1">{address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Car className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm md:text-base mb-1">
              Transportation Options
            </p>
            <div className="flex flex-wrap gap-2">
              {transportation.map((option, index) => (
                <span
                  key={index}
                  className="bg-gold/10 text-gold px-2 py-1 rounded-full text-xs"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ParkingCircle className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-800 text-sm md:text-base">
              Parking
            </p>
            <p className="text-xs md:text-sm text-gray-600 mt-1">{parking}</p>
          </div>
        </div>

        <button
          onClick={openMaps}
          className="elegant-button w-full mt-6 text-sm md:text-base"
        >
          <MapPin className="w-4 h-4 mr-2 inline" />
          Ver en Google Maps
        </button>
      </CardContent>
    </Card>
  );
}
