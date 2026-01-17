import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Reanimated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    withSequence
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SkeletonItem = ({ style }: { style: any }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    return <Reanimated.View style={[styles.skeletonDefaults, style, animatedStyle]} />;
};

export function CalendarSkeleton() {
    return (
        <View style={styles.container}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <SkeletonItem style={styles.year} />
                <SkeletonItem style={styles.month} />
            </View>

            {/* Grid Skeleton */}
            <View style={styles.grid}>
                 {/* Weekday Labels Row (Optional) */}
                 <View style={styles.row}>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <SkeletonItem key={`day-${i}`} style={styles.weekday} />
                    ))}
                 </View>

                {/* Grid Cells */}
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={styles.row}>
                        {Array.from({ length: 7 }).map((_, colIndex) => (
                            <View key={`cell-${rowIndex}-${colIndex}`} style={styles.cellContainer}>
                                 <SkeletonItem style={styles.cell} />
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 10,
    },
    skeletonDefaults: {
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    header: {
        height: 80,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    year: {
        width: 100,
        height: 20,
    },
    month: {
        width: 150,
        height: 30,
        marginTop: 5,
    },
    grid: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    weekday: {
        width: (width - 40) / 7,
        height: 20,
        marginBottom: 10,
    },
    cellContainer: {
        width: (width - 40) / 7,
        height: 80, // Approximate cell height
        justifyContent: 'center',
        alignItems: 'center',
    },
    cell: {
        width: '90%',
        height: '90%',
        borderRadius: 8,
    },
});
