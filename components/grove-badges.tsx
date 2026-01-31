import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Grove } from '@/assets/groves_data';

interface GroveBadgeProps {
  grove: Grove;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  showMemberCount?: boolean;
  onPress?: () => void;
  isActive?: boolean;
}

/**
 * Single grove badge component
 */
export function GroveBadge({
  grove,
  size = 'medium',
  showName = true,
  showMemberCount = false,
  onPress,
  isActive = false,
}: GroveBadgeProps) {
  const sizeStyles = {
    small: {
      padding: 4,
      paddingHorizontal: 8,
      borderRadius: 10,
      fontSize: 10,
      emojiSize: 12,
    },
    medium: {
      padding: 6,
      paddingHorizontal: 12,
      borderRadius: 14,
      fontSize: 12,
      emojiSize: 14,
    },
    large: {
      padding: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      fontSize: 14,
      emojiSize: 18,
    },
  };

  const currentSize = sizeStyles[size];

  const BadgeContent = () => (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: grove.color + (isActive ? '40' : '20'),
          borderColor: isActive ? grove.color : 'transparent',
          borderWidth: isActive ? 1 : 0,
          paddingVertical: currentSize.padding,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderRadius: currentSize.borderRadius,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: currentSize.emojiSize }]}>
        {grove.emoji}
      </Text>
      {showName && (
        <Text
          style={[
            styles.name,
            { color: grove.color, fontSize: currentSize.fontSize },
          ]}
        >
          {grove.name.replace(' Grove', '')}
        </Text>
      )}
      {showMemberCount && (
        <Text style={[styles.memberCount, { fontSize: currentSize.fontSize - 2 }]}>
          {grove.memberCount}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <BadgeContent />
      </TouchableOpacity>
    );
  }

  return <BadgeContent />;
}

interface GroveBadgesRowProps {
  groves: Grove[];
  size?: 'small' | 'medium' | 'large';
  showNames?: boolean;
  maxDisplay?: number;
  onBadgePress?: (grove: Grove) => void;
  activeGroveId?: string;
}

/**
 * Row of grove badges
 */
export function GroveBadgesRow({
  groves,
  size = 'small',
  showNames = true,
  maxDisplay = 3,
  onBadgePress,
  activeGroveId,
}: GroveBadgesRowProps) {
  const displayGroves = groves.slice(0, maxDisplay);
  const remaining = groves.length - maxDisplay;

  return (
    <View style={styles.badgesRow}>
      {displayGroves.map((grove) => (
        <GroveBadge
          key={grove.id}
          grove={grove}
          size={size}
          showName={showNames}
          onPress={onBadgePress ? () => onBadgePress(grove) : undefined}
          isActive={grove.id === activeGroveId}
        />
      ))}
      {remaining > 0 && (
        <View style={[styles.moreBadge, { padding: size === 'small' ? 4 : 6 }]}>
          <Text style={styles.moreText}>+{remaining}</Text>
        </View>
      )}
    </View>
  );
}

interface GroveChipProps {
  grove: Grove;
  isSelected?: boolean;
  onPress?: () => void;
}

/**
 * Selectable grove chip (for filters)
 */
export function GroveChip({ grove, isSelected = false, onPress }: GroveChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? grove.color : '#1F2937',
          borderColor: isSelected ? grove.color : '#374151',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.chipEmoji}>{grove.emoji}</Text>
      <Text
        style={[
          styles.chipText,
          { color: isSelected ? '#fff' : '#9CA3AF' },
        ]}
      >
        {grove.name.replace(' Grove', '')}
      </Text>
    </TouchableOpacity>
  );
}

interface GroveMemberBadgeProps {
  isMember: boolean;
  size?: 'small' | 'medium';
}

/**
 * Simple member status badge
 */
export function GroveMemberBadge({ isMember, size = 'small' }: GroveMemberBadgeProps) {
  const fontSize = size === 'small' ? 10 : 12;
  const padding = size === 'small' ? 4 : 6;

  return (
    <View
      style={[
        styles.memberBadge,
        {
          backgroundColor: isMember ? '#10B981' : '#6B7280',
          paddingVertical: padding,
          paddingHorizontal: padding * 2,
        },
      ]}
    >
      <Text style={[styles.memberBadgeText, { fontSize }]}>
        {isMember ? 'Member' : 'Non-member'}
      </Text>
    </View>
  );
}

interface GroveProgressBadgeProps {
  grove: Grove;
  progress: number;
  size?: 'small' | 'medium';
}

/**
 * Badge showing progress toward grove membership
 */
export function GroveProgressBadge({
  grove,
  progress,
  size = 'medium',
}: GroveProgressBadgeProps) {
  const required = grove.accessRules.minEventsAttended;
  const percentage = Math.min(100, Math.round((progress / required) * 100));
  const isComplete = progress >= required;

  return (
    <View
      style={[
        styles.progressBadge,
        { backgroundColor: grove.color + '20' },
      ]}
    >
      <Text style={styles.progressEmoji}>{grove.emoji}</Text>
      <View style={styles.progressInfo}>
        <Text style={[styles.progressName, { color: grove.color }]}>
          {grove.name}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: grove.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {isComplete ? 'Unlocked!' : `${progress}/${required}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    marginRight: 4,
  },
  name: {
    fontWeight: '600',
  },
  memberCount: {
    color: '#9CA3AF',
    marginLeft: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moreBadge: {
    backgroundColor: '#374151',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  memberBadge: {
    borderRadius: 8,
  },
  memberBadgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  progressEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 12,
    minWidth: 50,
  },
});

export default GroveBadge;
