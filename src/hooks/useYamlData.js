import { useEffect, useState, useContext } from 'react';
import yaml from 'yaml';
import LanguageContext from '../context/LanguageContext';

/**
 * Custom hook for loading YAML data with language support
 * @param {string} basePath - Base path of the YAML file (without language suffix)
 * @param {boolean} withLanguage - Whether to append language suffix (_en) for English
 * @returns {object} { data, isLoading, error }
 */
export function useYamlData(basePath, withLanguage = true) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Construct the file path based on language
    const filePath = withLanguage && language === 'en'
      ? basePath.replace(/\.yaml$/, '_en.yaml')
      : basePath;

    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
        }
        return response.text();
      })
      .then((text) => yaml.parse(text))
      .then((parsedData) => {
        setData(parsedData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Error loading YAML from ${filePath}:`, err);
        setError(err);
        setIsLoading(false);
      });
  }, [basePath, withLanguage, language]);

  return { data, isLoading, error };
}

/**
 * Custom hook for loading static YAML data (without language support)
 * @param {string} path - Path to the YAML file
 * @returns {object} { data, isLoading, error }
 */
export function useStaticYamlData(path) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
        }
        return response.text();
      })
      .then((text) => yaml.parse(text))
      .then((parsedData) => {
        setData(parsedData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Error loading YAML from ${path}:`, err);
        setError(err);
        setIsLoading(false);
      });
  }, [path]);

  return { data, isLoading, error };
}
