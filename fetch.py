import csv
from googleapiclient.discovery import build

# Replace with your API key
API_KEY = ''
CHANNEL_ID = 'UCZy9xs6Tn9vWqN_5l0EEIZA'

def get_channel_id(api_key, channel_name):
    youtube = build('youtube', 'v3', developerKey=api_key)
    
    search_response = youtube.search().list(
        part='snippet',
        q=channel_name,
        type='channel',
        maxResults=1
    ).execute()
    
    channel_id = search_response['items'][0]['id']['channelId']
    return channel_id


def get_videos(api_key, channel_id):
    youtube = build('youtube', 'v3', developerKey=api_key)

    # Get channel's uploads playlist ID
    response = youtube.channels().list(
        part='contentDetails',
        id=channel_id
    ).execute()
    
    uploads_playlist_id = response['items'][0]['contentDetails']['relatedPlaylists']['uploads']

    videos = []
    next_page_token = None

    while True:
        playlist_response = youtube.playlistItems().list(
            part='snippet',
            playlistId=uploads_playlist_id,
            maxResults=50,
            pageToken=next_page_token
        ).execute()

        for item in playlist_response['items']:
            video_title = item['snippet']['title']
            video_description = item['snippet']['description']
            video_id = item['snippet']['resourceId']['videoId']
            video_url = f'https://www.youtube.com/watch?v={video_id}'

            videos.append({
                'title': video_title,
                'description': video_description,
                'url': video_url
            })

        next_page_token = playlist_response.get('nextPageToken')

        if not next_page_token:
            break

    return videos

def save_to_csv(videos, filename='videos.csv'):
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['title', 'description', 'url'])
        writer.writeheader()
        writer.writerows(videos)

# Replace with your API key and channel ID
videos = get_videos(API_KEY, CHANNEL_ID)
print(videos)
save_to_csv(videos)

# print(get_channel_id(API_KEY, 'Signs'))