import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E8E8',
  },
  header: {
    backgroundColor: '#006400',
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subLogoText: {
    color: '#A9DFBF',
    fontSize: 10,
    marginBottom: 20,
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  formArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 30,
    paddingHorizontal: 25,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 25,
  },
  label: {
    fontSize: 13,
    color: '#34495E',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F8F9F9',
    marginBottom: 15,
  },
  forgotPassContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPassText: {
    color: '#006400',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#006400',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#7F8C8D',
    fontSize: 14,
  },
  footerLink: {
    color: '#006400',
    fontSize: 14,
    fontWeight: 'bold',
  },
});