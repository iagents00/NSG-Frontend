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
            className="flex items-center justify-between px-3 py-2.5 text-[0.6rem] font-bold uppercase tracking-widest bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/20"
            title={`Location: ${locationText}\nTimezone: ${userLocation.timezone || 'N/A'}\nCoordinates: ${userLocation.latitude}, ${userLocation.longitude}`}
        >
            <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-blue-400" /> Location
            </span>
            <span className="text-blue-400 flex items-center gap-1.5 truncate max-w-[140px] font-black" title={locationText}>
                {locationText}
            </span>
        </div>
    );
}
