import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBoxProps {
    placeholder: string;
    onSearch: (search: string) => void;
    

}
export default function SearchBox({placeholder, onSearch}: SearchBoxProps) {
    const [search, setSearch] = useState('');
    const handleSearch = () => {
        onSearch(search);
    }
    return (

        <View style={styles.searchInputContainer}>
            <View style={styles.searchInputWrapper}>
                <Ionicons name="search-outline" size={20} color="#0B4A8B" />
                <TextInput
                    placeholder={placeholder}
                    style={styles.searchBox}
                    placeholderTextColor="#94A3B8"
                    value={search}
                    onChangeText={(text) => {
                        setSearch(text);
                        onSearch(text);
                    }}
                />
            </View>
            <TouchableOpacity onPress={handleSearch} style={styles.filterButton} activeOpacity={0.85}>
                <Ionicons name="filter-outline" size={20} color="#fff" />
            </TouchableOpacity>
        </View>

    )
}



const styles = StyleSheet.create({
    searchInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginVertical: 12,
    
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 48,
    paddingHorizontal: 12,
  },
  searchBox: {
    flex: 1,
    paddingHorizontal: 8,
    height: '100%',
    fontSize: 14,
    color: '#1E293B',
  },
  filterButton: {
    backgroundColor: '#0B4A8B',
    height: 48,
    width: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
