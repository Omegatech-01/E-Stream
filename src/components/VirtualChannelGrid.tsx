import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Channel } from '../types';
import { ChannelCard } from './ChannelCard';

interface VirtualChannelGridProps {
  channels: Channel[];
  activeChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite?: (channelId: string) => void;
  onToggleSubscription?: (channelId: string) => void;
  scrollElementRef: React.RefObject<HTMLDivElement | null>;
}

export const VirtualChannelGrid: React.FC<VirtualChannelGridProps> = ({
  channels,
  activeChannel,
  onSelectChannel,
  onToggleFavorite,
  onToggleSubscription,
  scrollElementRef,
}) => {
  const [columns, setColumns] = useState(6);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(2);
      else if (width < 768) setColumns(3);
      else if (width < 1024) setColumns(4);
      else if (width < 1280) setColumns(5);
      else setColumns(6);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const channelRows = useMemo(() => {
    const rows: Channel[][] = [];
    for (let i = 0; i < channels.length; i += columns) {
      rows.push(channels.slice(i, i + columns));
    }
    return rows;
  }, [channels, columns]);

  const rowVirtualizer = useVirtualizer({
    count: channelRows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 280, 
    overscan: 3,
  });

  return (
    <div
      className="w-full relative"
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const rowChannels = channelRows[virtualRow.index];
        return (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5"
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {rowChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isActive={activeChannel?.id === channel.id}
                onSelect={onSelectChannel}
                onToggleFavorite={onToggleFavorite}
                onToggleSubscription={onToggleSubscription}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};
