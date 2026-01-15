"use client";
import { useAppStore } from "@/store/useAppStore";
import { MapPin } from "lucide-react";

export default function LocationIndicator() {
    const { userLocation } = useAppStore();

    if (!userLocation) {
        return null;
    }

    // Display city and country if available, otherwise show timezone
    const getLocationText = () => {
        if (userLocation.city && userLocation.country) {
            return `${userLocation.city}, ${userLocation.country}`;
        }
        if (userLocation.city) {
            return userLocation.city;
        }
        if (userLocation.country) {
            return userLocation.country;
        }
        // Fallback to timezone if no city/country
        if (userLocation.timezone) {
            const tzParts = userLocation.timezone.split('/');
            return tzParts[tzParts.length - 1].replace(/_/g, ' ');
        }
        return 'Unknown';
    };

    const locationText = getLocationText();

    return (
        <div
            className="flex items-center justify-between px-2 py-1 text-[0.5rem] font-medium uppercase tracking-wider bg-blue-500/5 rounded border border-blue-500/10"
            title={`Location: ${locationText}\nTimezone: ${userLocation.timezone || 'N/A'}\nCoordinates: ${userLocation.latitude}, ${userLocation.longitude}`}
        >
            <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-2 h-2 text-blue-400" /> Location
            </span>
            <span className="text-blue-400 flex items-center gap-1 truncate max-w-[110px] font-bold" title={locationText}>
                {locationText}
            </span>
        </div>
    );
}
